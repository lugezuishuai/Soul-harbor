import safeRegex from 'safe-regex';

// 不进行token解析的路径
export const notTokenPath = [
  /^\/api\/user\/(register|login|sendRegisterVerifyCode|forgetPassword|checkTokenValid|updatePassword|sendLoginVerifyCode|loginByEmail|xsrf)$/,
  /^\/api\/employee|file\/(.*?)/,
  /^\/static\/(.*?)/,
].filter((item) => safeRegex(item));
