import { Request, Response } from 'express';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import query from '../../../utils/query';
import { escape, format } from 'sqlstring';
import { UnSuccessCodeType } from '../code-type';
import { BCRYPT_SALT_ROUNDS } from '../userInfo';
import { isDevelopment } from '../../../app';

const { expiredOrUnValid } = UnSuccessCodeType;

export async function updatePassword(req: Request, res: Response) {
  try {
    const { username, password, token } = req.body;
    const searchUserInfo = `select soul_user_info.soul_username, soul_user_info.soul_email, forget_pw_token.expire_time from soul_user_info, forget_pw_token where binary soul_user_info.soul_email = forget_pw_token.email and binary forget_pw_token.token = ${escape(
      token
    )}`;
    const result = await query(searchUserInfo);

    if (result?.length !== 1) {
      return res.status(200).json({
        code: expiredOrUnValid,
        data: {},
        msg: 'no valid link or link expired',
      });
    } else {
      const { soul_username, expire_time, soul_email } = result[0];
      if (username === soul_username && Number(expire_time) >= dayjs(new Date()).valueOf()) {
        // 链接没有失效
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const updatePassword = format(
          'update soul_user_info set soul_username = ?, soul_password = ? where binary soul_email = ?',
          [username, hashedPassword, soul_email]
        );
        await query(updatePassword);

        return res.status(200).json({
          code: 0,
          data: {},
          msg: 'update password success',
        });
      } else {
        // 链接已经失效
        return res.status(200).json({
          code: expiredOrUnValid,
          data: {},
          msg: 'no valid link or link expired',
        });
      }
    }
  } catch (e) {
    isDevelopment && console.error(e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
