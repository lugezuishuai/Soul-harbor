import jwt from 'jsonwebtoken';
export const jwtSecret = 'soulHarbor';

interface UserInfo {
  username: string;
  uid: string;
  email: string;
  signature: string;
  birth: string;
}

// 生成token的方法
export const setToken = (userInfo: UserInfo) => {
  return new Promise((resolve, reject) => {
    try {
      // 注意默认情况 Token 必须以 Bearer+空格 开头
      const token =
        'Bearer ' +
        jwt.sign(userInfo, jwtSecret, {
          expiresIn: '1d',
        });
      resolve({
        token,
        userInfo,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};
