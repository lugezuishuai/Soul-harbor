import { Request, Response } from 'express';

export function xsrf(req: Request, res: Response) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrftoken = req.csrfToken();
  res.status(200).json({
    code: 0,
    data: {},
    msg: 'csrfToken init success',
  });
}
