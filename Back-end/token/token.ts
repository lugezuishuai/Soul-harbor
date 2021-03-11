import jwt from 'jsonwebtoken';
export const jwtSecret = 'soulHarbor';

// 生成token的方法
export const setToken = (username: string, uuid: string) => {
  return new Promise((resolve, reject) => {
    // 注意默认情况 Token 必须以 Bearer+空格 开头
    const token = 'Bearer ' + jwt.sign(
      {
        username,
        uuid,
      },
      jwtSecret,
      {
        expiresIn: '1d'
      },
    );
    resolve(token);
  });
};
