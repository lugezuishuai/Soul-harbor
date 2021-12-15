import { Request, Response } from 'express';
import os from 'os';
import md5 from 'md5';
import dayjs from 'dayjs';
import { escape, format } from 'sqlstring';
import { getIPAddress } from '../../../utils/getIPAddress';
import { matchUrls } from '../../../utils/matchUrl';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { isDevelopment } from '../../../app';

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
    const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth } = userInfo[0];
    let { soul_avatar } = userInfo[0];

    if (soul_avatar) {
      const oldIPAddress = matchUrls(soul_avatar)?.address; // 防止因为网络发生变化导致ip地址发生变化
      const newIPAddress = process.env.SERVICE_IP || getIPAddress(os.networkInterfaces());

      if (oldIPAddress !== newIPAddress) {
        // 如果IP地址发生了改变，要修改头像链接的IP地址
        soul_avatar = soul_avatar.replace(oldIPAddress, newIPAddress);
        const updateAvatar = format('update soul_user_info set soul_avatar = ? where soul_uuid = ?', [
          soul_avatar,
          soul_uuid,
        ]);
        await query(updateAvatar);
      }
    }

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
