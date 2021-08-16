import { Request, Response } from 'express';

export function xsrf(req: Request, res: Response) {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { path: '/' });
  res.locals.csrftoken = req.csrfToken();
  res.status(200).json({
    code: 0,
    data: {},
    msg: 'csrfToken init success',
  });
}
