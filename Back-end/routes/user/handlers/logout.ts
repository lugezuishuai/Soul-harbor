import { NextFunction, Request, Response } from 'express';
import { isDevelopment } from '../../../config/constant';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';

const { noPermission } = UnSuccessCodeType;

export async function logout(req: Request, res: Response, next: NextFunction) {
  const { uuid } = req.cookies;
  // @ts-ignore
  const { token } = req.session;
  if (!isDevelopment && !(await hasPermission(uuid, token))) {
    return res.status(403).json({
      code: noPermission,
      data: {},
      msg: 'no permission',
    });
  }
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
  res.cookie('token', '', {
    path: '/',
    maxAge: -1,
  });
  req.session = null;

  return res.status(200).json({
    code: 0,
    data: {},
    msg: 'success logout',
  });
}
