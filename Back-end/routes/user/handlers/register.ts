import { Request, Response } from 'express';
import passport from 'passport';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { escape, format } from 'sqlstring';
import { isDevelopment } from '../../../app';

const { alreadyExit, noMatch, expiredOrUnValid, clientError } = UnSuccessCodeType;

export function register(req: Request, res: Response) {
  passport.authenticate('register', (err, user, info) => {
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
        case 'username or email already taken':
          return res.status(200).json({
            code: alreadyExit,
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
          const { email } = req.body;
          const data = {
            username: user.soul_username,
            email,
          };
          const searchUsername = `select * from soul_user_info where binary soul_username = ${escape(data.username)}`;
          const updateUser = format('update soul_user_info set soul_email = ? where soul_username = ?', [
            data.email,
            data.username,
          ]);

          const searchResult = await query(searchUsername);
          if (searchResult?.length !== 1) {
            return res.status(400).json({
              code: clientError,
              data: {},
              msg: 'client error',
            });
          }

          await query(updateUser);
          return res.status(200).json({
            code: 0,
            data: {},
            msg: 'user created success',
          });
        } catch (e) {
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
