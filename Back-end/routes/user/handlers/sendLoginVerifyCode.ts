import { Request, Response } from 'express';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import { escape, format } from 'sqlstring';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { BCRYPT_SALT_ROUNDS } from '..';
import { transporter } from '../../../config/nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { isDevelopment } from '../../../app';

const { badAccount, clientError } = UnSuccessCodeType;

export async function sendLoginVerifyCode(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'email require',
      });
    } else {
      const searchEmail = `select * from soul_user_info where binary soul_email = ${escape(email)}`;
      const searchResult = await query(searchEmail);
      if (searchResult?.length !== 1) {
        return res.status(200).json({
          code: badAccount,
          data: {},
          msg: 'please check your email',
        });
      }

      const checkEmail = `select * from login_verify_code where binary email = ${escape(email)}`;
      const checkResult = await query(checkEmail);
      const verify_code = md5(uuidv4()).slice(0, 6).toLowerCase(); // 生成一个6位数的验证码
      const verify_codeMd5 = md5(md5(email + md5(verify_code))); // 使用md5再次加密
      const expire_time = (dayjs(new Date()).valueOf() + 60000).toString(); // 60s过期时间

      const mailOptions: Mail.Options = {
        from: `${process.env.EMAIL_ADDRESS}`,
        to: `${email}`,
        subject: 'Soul-Harbor-Here is your login verification code',
        html: `<div>
              <h1>Your login verification code is:</h1>
              <br/>
              <h2>${verify_code}</h2>
              <br/>
              <div>Please use your login verification code within 60 seconds, otherwise it will be invalid</div>
            </div>`,
      };

      isDevelopment && console.log('sending email');
      const hashedVerifyCode = await bcrypt.hash(verify_codeMd5, BCRYPT_SALT_ROUNDS);

      if (!checkResult || checkResult?.length === 0) {
        // 新增验证码
        const insertVerifyCode = format(
          'insert into login_verify_code (email, verify_code, expire_time) values (?, ?, ?)',
          [email, verify_code, expire_time]
        );

        await query(insertVerifyCode);
      } else {
        // 更新验证码
        const updateVerifyCode = format(
          'update login_verify_code set verify_code = ?, expire_time = ? where binary email = ?',
          [hashedVerifyCode, expire_time, email]
        );

        await query(updateVerifyCode);
      }

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          isDevelopment && console.error('Error: ', err);
          return res.status(500).json({
            code: 1,
            data: {},
            msg: 'Failed to send verification code',
          });
        } else {
          isDevelopment && console.log('here is the res: ', response);
          return res.status(200).json({
            code: 0,
            data: {},
            msg: 'Success to send verification code',
          });
        }
      });
    }
  } catch (e: any) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
