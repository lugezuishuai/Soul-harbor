import { Request, Response } from 'express';
import passport from 'passport';
import md5 from 'md5';
import dayjs from 'dayjs';
import { UnSuccessCodeType } from '../code-type';
import { setToken } from '../../../config/token/token';
import { isDevelopment } from '../../../config/constant';

const { badAccount, noMatch, expiredOrUnValid } = UnSuccessCodeType;

export async function loginByEmail(req: Request, res: Response) {
  passport.authenticate('loginByEmail', (err, user, info) => {
    if (err) {
      isDevelopment && console.error('Error: ', err);
      return res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    } else if (info) {
      isDevelopment && console.error(info.message);
      switch (info.message) {
        case 'bad email':
          return res.status(200).json({
            code: badAccount,
            data: {},
            msg: info.message,
          });
        case 'verify_code do not match':
          return res.status(200).json({
            code: noMatch,
            data: {},
            msg: info.message,
          });
        default:
          return res.status(200).json({
            code: expiredOrUnValid,
            data: {},
            msg: info.message,
          });
      }
    } else {
      req.logIn(user, async () => {
        try {
          const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth, soul_avatar } = user;
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
