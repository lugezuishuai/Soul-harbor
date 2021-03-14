import bcrypt from 'bcryptjs';
import passport from 'passport';
import query from '../models/query';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Strategy as LocalStrategy } from 'passport-local';

const BCRYPT_SALT_ROUNDS = 12;

// register校验
passport.use('register', new LocalStrategy(
  {
    // @ts-ignore
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
    session: false,
  },
  (req, username, password, done) => {
    const { email } = req.body;

    const searchUsernameAndEmail = `select * from soulUserInfo where binary soulUsername = '${username}' or binary soulEmail = '${email}'`;

    query(searchUsernameAndEmail)
    .then(result => {
      if (result.length > 0) {
        console.log('username or email already taken');
        return done(null, false, {
          message: 'username or email already taken',
        });
      } else {
        bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
        .then(hashedPassword => {
          const createUser = `insert into soulUserInfo (soulUsername, soulEmail, soulPassword, soulUuid) values ('${username}', '${email}', '${hashedPassword}', '${uuidv4()}')`;
          const searchNewUser = `select * from soulUserInfo where binary soulUsername = '${username}' and binary soulEmail = '${email}' and soulPassword = '${hashedPassword}'`;
          query(createUser)
          .then(() => {
            return query(searchNewUser);
          })
          .then(user => {
            return done(null, user[0]);
          });
        });
      }
    })
    .catch(err => {
      return done(err);
    });
  },
));

// login校验
passport.use('login', new LocalStrategy(
  {
    // @ts-ignore
    usernameField: 'username',
    passwordField: 'password',
    session: false,
  },
  (username, password, done) => {
    const searchUsername = `select * from soulUserInfo where binary soulUsername = '${username}'`;
    query(searchUsername)
    .then(user => {
      if (!user || user.length === 0) {
        return done(null, false, {
          message: 'bad username',
        });
      } else {
        bcrypt.compare(password, user[0].soulPassword)
        .then(response => {
          if (!response) {
            console.log('password do not match');
            return done(null, false, {
              message: 'password do not match',
            })
          } else {
            console.log('user found & authenticated');
            return done(null, user[0]); // 第二个参数就是req.user
          }
        });
      }
    })
    .catch(err => {
      return done(err);
    });
  }
));

// loginByEmail校验
passport.use('loginByEmail', new LocalStrategy(
  {
    // @ts-ignore
    usernameField: 'email',
    passwordField: 'verifyCode',
    session: false,
  },
  (username, password, done) => {
    const searchEmail = `select * from soulUserInfo where binary soulEmail = '${username}'`;
    query(searchEmail)
    .then(user => {
      if (!user || user.length === 0) {
        return done(null, false, {
          message: 'bad email',
        });
      } else {
        const searchVerifyCode = `select * from loginVerifyCode where email = '${username}'`;
        query(searchVerifyCode)
        .then(result => {
          bcrypt.compare(password, result[0].verifyCode)
          .then(response => {
            if (!response) {
              console.log('verifyCode do not match');
              return done(null, false, {
                message: 'verifyCode do not match',
              });
            } else {
              if (Number(result[0].expireTime) >= dayjs(new Date()).valueOf()) {
                // 验证码尚未过期
                console.log('verifyCode is valid');
                return done(null, user[0]);
              } else {
                // 验证码已过期
                console.log('verifyCode already expired');
                return done(null, false, {
                  message: 'verifyCode already expired',
                });
              }
            }
          });
        });
      }
    })
    .catch(err => {
      return done(err);
    });
  }
));