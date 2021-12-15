import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { escape } from 'sqlstring';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { isDevelopment } from '../../../app';

const { expiredOrUnValid, clientError } = UnSuccessCodeType;

export async function checkTokenValid(req: Request, res: Response) {
  try {
    const { resetPasswordToken } = req.query;
    const searchToken = `select * from forget_pw_token where token = ${escape(resetPasswordToken)}`;
    const searchResult = await query(searchToken);
    if (searchResult?.length !== 1) {
      return res.status(200).json({
        code: expiredOrUnValid,
        data: {},
        msg: 'no valid link or link expired',
      });
    }

    if (Number(searchResult[0].expire_time) >= dayjs(new Date()).valueOf()) {
      const searchUsername = `select soul_username from soul_user_info where binary soul_email = ${searchResult[0].email}`;
      const username: { soul_username: string }[] = await query(searchUsername);

      if (username?.length !== 1) {
        return res.status(400).json({
          code: clientError,
          data: {},
          msg: 'client error',
        });
      }

      return res.status(200).json({
        code: 0,
        data: {
          username: username[0].soul_username,
        },
        msg: 'password reset link a-ok',
      });
    } else {
      return res.status(200).json({
        code: expiredOrUnValid,
        data: {},
        msg: 'no valid link or link expired',
      });
    }
  } catch (e: any) {
    isDevelopment && console.error(e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
