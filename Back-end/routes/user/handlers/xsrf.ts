import { Request, Response } from 'express';

export function xsrf(req: Request, res: Response) {
  const csrfToken = req.csrfToken();

  // 往cookies中注入csrfToken，给前端在请求的时候在headers中带上csrf-token参数使用，配合注入到cookies中的_csrf token secret一起校验
  res.cookie('XSRF-TOKEN', csrfToken);
  res.locals.csrftoken = csrfToken;
  res.status(200).json({
    code: 0,
    data: {},
    msg: 'csrfToken init success',
  });
}
