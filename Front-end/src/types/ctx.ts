import { Request } from 'express';

export interface Ctx {
  req?: Request; // express的req
  initialData?: any; // 初始数据
}
