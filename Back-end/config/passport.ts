import bcrypt from 'bcryptjs';
import passport from 'passport';
import query from '../utils/query';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Strategy as LocalStrategy } from 'passport-local';

const BCRYPT_SALT_ROUNDS = 12;

// register校验
passport.use(
  'register',
  new LocalStrategy(
    {
      // @ts-ignore
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
      session: false,
    },
    (req, username, password, done) => {
      const { email, verify_code } = req.body;

      const searchUsernameAndEmail = `select * from soul_user_info where binary soul_username = '${username}' or binary soul_email = '${email}'`;

      query(searchUsernameAndEmail)
        .then((result) => {
          if (result.length > 0) {
            // 已经注册过用户名或邮箱
            return done(null, false, {
              message: 'username or email already taken',
            });
          } else {
            // 用户名和邮箱尚未被注册过，查找该邮箱的验证码
            const searchVerifyCode = `select * from register_verify_code where email = '${email}'`;
            query(searchVerifyCode).then((result) => {
              if (!result || result.length === 0) {
                // 该邮箱尚未发送过验证码
                return done(null, false, {
                  message: 'verify_code do not match',
                });
              } else {
                // 已经发送过验证码
                bcrypt.compare(verify_code, result[0].verify_code).then((response) => {
                  if (!response) {
                    return done(null, false, {
                      message: 'verify_code do not match',
                    });
                  } else {
                    if (Number(result[0].expire_time) >= dayjs(new Date()).valueOf()) {
                      // 验证码尚未过期，生成密码
                      const uuid = uuidv4(); // 生成随机的uuid
                      bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then((hashedPassword) => {
                        const createUser = `insert into soul_user_info (soul_username, soul_password, soul_email, soul_uuid) values ('${username}', '${hashedPassword}', '${email}', '${uuid}')`;
                        const searchNewUser = `select * from soul_user_info where binary soul_username = '${username}' and soul_password = '${hashedPassword}'`;
                        query(createUser)
                          .then(() => {
                            return query(searchNewUser);
                          })
                          .then((user) => {
                            return done(null, user[0]);
                          });
                      });
                    } else {
                      // 验证码已过期
                      return done(null, false, {
                        message: 'verify_code already expired',
                      });
                    }
                  }
                });
              }
            });
          }
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

// login校验
passport.use(
  'login',
  new LocalStrategy(
    {
      // @ts-ignore
      usernameField: 'username',
      passwordField: 'password',
      session: false,
    },
    (username, password, done) => {
      const searchUsername = `select * from soul_user_info where binary soul_username = '${username}'`;
      query(searchUsername)
        .then((user) => {
          if (!user || user.length === 0) {
            return done(null, false, {
              message: 'bad username',
            });
          } else {
            bcrypt.compare(password, user[0].soul_password).then((response) => {
              if (!response) {
                return done(null, false, {
                  message: 'password do not match',
                });
              } else {
                return done(null, user[0]); // 第二个参数就是req.user
              }
            });
          }
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

// loginByEmail校验
passport.use(
  'loginByEmail',
  new LocalStrategy(
    {
      // @ts-ignore
      usernameField: 'email',
      passwordField: 'verify_code',
      session: false,
    },
    (username, password, done) => {
      const searchEmail = `select * from soul_user_info where binary soul_email = '${username}'`;
      query(searchEmail)
        .then((user) => {
          if (!user || user.length === 0) {
            return done(null, false, {
              message: 'bad email',
            });
          } else {
            const searchVerifyCode = `select * from login_verify_code where email = '${username}'`;
            query(searchVerifyCode).then((result) => {
              if (!result || result.length === 0) {
                // 该邮箱尚未发送过验证码
                return done(null, false, {
                  message: 'verify_code do not match',
                });
              } else {
                // 已经发送过验证码
                bcrypt.compare(password, result[0].verify_code).then((response) => {
                  if (!response) {
                    return done(null, false, {
                      message: 'verify_code do not match',
                    });
                  } else {
                    if (Number(result[0].expire_time) >= dayjs(new Date()).valueOf()) {
                      // 验证码尚未过期
                      return done(null, user[0]);
                    } else {
                      // 验证码已过期
                      return done(null, false, {
                        message: 'verify_code already expired',
                      });
                    }
                  }
                });
              }
            });
          }
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
