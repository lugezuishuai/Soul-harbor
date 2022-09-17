import { Request, Response } from 'express';
import passport from 'passport';
import { format } from 'sqlstring';
import md5 from 'md5';
import { query } from '../../../utils/query';
import os from 'os';
import dayjs from 'dayjs';
import { UnSuccessCodeType } from '../code-type';
import { matchUrls } from '../../../utils/matchUrl';
import { getIPAddress } from '../../../utils/getIPAddress';
import { setToken } from '../../../config/token/token';
import { isDevelopment } from '../../../app';

const { badAccount, noMatch } = UnSuccessCodeType;

export function loginByUsername(req: Request, res: Response) {
  passport.authenticate('login', (err, user, info) => {
    if (err) {
      isDevelopment && console.error('Error: ', err);
      return res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    } else if (info) {
      isDevelopment && console.error(info.message);
      if (info.message === 'bad username') {
        return res.status(200).json({
          code: badAccount,
          data: {},
          msg: info.message,
        });
      } else {
        return res.status(200).json({
          code: noMatch,
          data: {},
          msg: info.message,
        });
      }
    } else {
      req.logIn(user, async () => {
        try {
          const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth } = user;
          let { soul_avatar } = user;

          if (soul_avatar) {
            const oldIPAddress = matchUrls(soul_avatar)?.address; // 防止因为网络发生变化导致ip地址发生变化
            const newIPAddress = process.env.SERVER_HOST || getIPAddress(os.networkInterfaces());

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

          const userInfo = {
            username: soul_username,
            uid: soul_uuid,
            signature: soul_signature,
            birth: soul_birth,
            email: soul_email,
            avatar: soul_avatar,
          };
          const token = await setToken(userInfo);
          res.cookie('uuid', userInfo.uid);
          // @ts-ignore
          req.session.token = md5(dayjs().valueOf() + md5(userInfo.uid)); // 设置session
          return res.status(200).json({
            code: 0,
            data: token,
            msg: 'user found & logged in',
          });
        } catch (e: any) {
          isDevelopment && console.error('Error: ', e);
          return res.status(500).json({
            code: 1,
            data: {},
            msg: e.message.toString(),
          });
        }
      });
    }
  })(req, res);
}
