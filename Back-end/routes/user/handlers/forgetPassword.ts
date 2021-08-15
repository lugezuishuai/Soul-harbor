import { Request, Response } from 'express';
import { UnSuccessCodeType } from '../code-type';
import query from '../../../utils/query';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { transporter } from '../../../config/nodemailer';
import { escape, format } from 'sqlstring';
import { isDevelopment } from '../../../app';
import Mail from 'nodemailer/lib/mailer';

const { badAccount, clientError } = UnSuccessCodeType;

export async function forgetPassword(req: Request, res: Response) {
  try {
    const clientAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || '';
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'email required',
      });
    } else {
      const searchEmail = `select * from soul_user_info where binary soul_email = ${escape(email)}`;
      const searchResult = await query(searchEmail);
      if (searchResult?.length === 0) {
        return res.status(200).json({
          code: badAccount,
          data: {},
          msg: 'email not in db',
        });
      } else {
        const checkEmail = `select * from forget_pw_token where binary email = ${escape(email)}`;
        const checkResult = await query(checkEmail);
        const token = crypto.randomBytes(20).toString('hex'); // 生成一个随机的令牌
        const expire_time = (dayjs(new Date()).valueOf() + 3600000).toString(); // 1h过期时间

        const mailOptions: Mail.Options = {
          from: `${process.env.EMAIL_ADDRESS}`,
          to: `${email}`,
          subject: 'Soul-Harbor-This is the link to reset your password',
          html: `<div>
                <h1>The link to reset your password is:</h1>
                <br/>
                <a href="http://${process.env.SERVICE_IP || 'localhost'}:${
            process.env.FRONT_END_PORT || 5000
          }/reset/${token}" target="_blank">http://${process.env.SERVICE_IP || 'localhost'}:${
            process.env.FRONT_END_PORT || 5000
          }/reset/${token}</a>
                <br/>
                <h2>Note: the IP address to send the link is:</h2>
                <br/>
                <h3>${clientAddress}</h3>
                <br/>
                <div>This link is valid for 5 minutes. Please enter this link within 5 minutes to reset your password</div>
              </div>`,
        };

        isDevelopment && console.log('send email');

        if (checkResult?.length === 0) {
          // 新增链接令牌
          const insertToken = format('insert into forget_pw_token (email, token, expire_time) values (?, ?, ?)', [
            email,
            token,
            expire_time,
          ]);

          await query(insertToken);
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              isDevelopment && console.error('Error: ', err);
              return res.status(500).json({
                code: 1,
                data: {},
                msg: 'Failed to send forgetPw token',
              });
            } else {
              isDevelopment && console.log('here is the res: ', response);
              return res.status(200).json({
                code: 0,
                data: {},
                msg: 'Success to send forgetPw token',
              });
            }
          });
        } else {
          // 更新链接令牌
          const updateToken = format('update forget_pw_token set token = ?, expire_time = ? where binary email = ?', [
            token,
            expire_time,
            email,
          ]);

          await query(updateToken);
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              isDevelopment && console.error('Error: ', err);
              return res.status(500).json({
                code: 1,
                data: {},
                msg: 'Failed to send forgetPw token',
              });
            } else {
              isDevelopment && console.log('here is the res: ', response);
              return res.status(200).json({
                code: 0,
                data: {},
                msg: 'Success to send forgetPw token',
              });
            }
          });
        }
      }
    }
  } catch (e) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
