import { RequestHandler } from 'express';
import Handlebars from 'handlebars';
import fse from 'fs-extra';
import path from 'path';
import { redisExpire, redisGet, redisSet } from '../../utils/redis';
import { isDevelopment } from '../../config/constant';

export const ssr: RequestHandler = async (req, res, next) => {
  try {
    const html = fse.readFileSync(path.resolve(__dirname, '../../static/index.html'));
    const template = Handlebars.compile(html.toString());

    const ssrCacheKey = 'ssr-template';
    let ssrCache = await redisGet(ssrCacheKey);

    if (ssrCache) {
      return res.status(200).send(ssrCache);
    }

    const SSR = await import(path.resolve(__dirname, '../../static/ssr/app.js'));
    const rootContent = (await SSR?.serverRender?.(req)?.rootContent) ?? '';

    ssrCache = template({
      rootContent,
      userInfo: null,
    });

    redisSet(ssrCacheKey, ssrCache);
    redisExpire(ssrCacheKey, 60 * 60); // 设置1小时缓存时间

    return res.status(200).send(ssrCache);
  } catch (e) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: 'internal error',
    });
  } finally {
    next();
  }
};
