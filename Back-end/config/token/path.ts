import safeRegex from 'safe-regex';
import { isDevelopment } from '../constant';

// 不进行token解析的路径
export const notTokenPath = (
  isDevelopment
    ? [/^\/api\/(.*?)/, /^\/static\/(.*?)/]
    : [
        /^\/api\/user\/(register|login|sendRegisterVerifyCode|forgetPassword|checkTokenValid|updatePassword|sendLoginVerifyCode|loginByEmail|xsrf)$/,
        /^\/api\/employee|file\/(.*?)/,
        /^\/static\/(.*?)/,
      ]
).filter((item) => safeRegex(item));
