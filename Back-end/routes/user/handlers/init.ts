import { Request, Response } from 'express';
import md5 from 'md5';
import dayjs from 'dayjs';
import { escape } from 'sqlstring';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { isDevelopment } from '../../../config/constant';

const { clientError } = UnSuccessCodeType;

export async function init(req: Request, res: Response) {
  try {
    // @ts-ignore
    const { uid } = req.user;
    const getUserInfo = `select soul_username, soul_uuid, soul_email, soul_signature, soul_birth, soul_avatar from soul_user_info where soul_uuid = ${escape(
      uid
    )}`;
    const userInfo = await query(getUserInfo);
    if (!userInfo.length) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client error',
      });
    }
    if (userInfo.length > 1) {
      throw new Error('invalid uuid');
    }
    const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth, soul_avatar } = userInfo[0];

    res.cookie('uuid', soul_uuid);
    // @ts-ignore
    req.session.token = md5(dayjs().valueOf() + md5(soul_uuid)); // 设置session
    return res.status(200).json({
      code: 0,
      data: {
        userInfo: {
          username: soul_username,
          uid: soul_uuid,
          email: soul_email,
          birth: soul_birth,
          signature: soul_signature,
          avatar: soul_avatar,
        },
      },
      msg: 'init success',
    });
  } catch (e: any) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
