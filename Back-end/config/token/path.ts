import safeRegex from 'safe-regex';

// 不进行token解析的路径
export const notTokenPath = [
  /^\/soul-harbor\/api\/user\/(register|login|sendRegisterVerifyCode|forgetPassword|checkTokenValid|updatePassword|sendLoginVerifyCode|loginByEmail|xsrf)$/,
  /^\/soul-harbor\/api\/employee|file\/(.*?)/,
  /^\/soul-harbor\/static\/(.*?)/,
].filter((item) => safeRegex(item));
