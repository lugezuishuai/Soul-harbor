import express from 'express';
import bodyParser from 'body-parser';
import query from '../../models/query';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import passport from 'passport';
import { setToken } from '../../config/token/token';
import * as _ from 'lodash';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env' });

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据
const BCRYPT_SALT_ROUNDS = 12;

// // 注册用户
// router.post('/register', urlencodedParser, async (req, res) => {
//   const { username, password, email,  createTime } = req.body;
//   const uuid = uuidv4();
//   const encryptedPw = md5(md5(username + md5(password)));
//   const checkUsername = `select soulUsername from soulUserInfo where binary soulUsername = '${username}'`;
//   const checkemail = `select soulEmail from soulUserInfo where binary soulEmail = '${email}'`;
//   const registerSql = `insert into soulUserInfo (soulUsername, soulPassword, soulEmail, soulCreateTime, soulUuid) values ('${username}', '${encryptedPw}', '${email}', '${createTime}', '${uuid}')`;
//   query(checkUsername, 'userInfo')
//   .then(result => {
//     if (result.length > 0) {
//       throw new Error('username already exists');
//     } else {
//       return query(checkemail, 'userInfo');
//     }
//   })
//   .then(result => {
//     if (result.length > 0) {
//       throw new Error('email already exists');
//     } else {
//       return query(registerSql, 'userInfo');
//     }
//   })
//   .then(result => {
//     res.json({
//       code: 0,
//       data: {
//         key: result.insertId,
//         id: result.insertId,
//       },
//       msg: 'register success',
//     })
//   })
//   .catch(e => {
//     if (e.message === 'username already exists') {
//       res.status(500).json({
//         code: 2,
//         data: {},
//         msg: 'username already exists',
//       })
//     } else if (e.message === 'email already exists') {
//       res.status(500).json({
//         code: 3,
//         data: {},
//         msg: 'email already exists',
//       })
//     } else {
//       res.status(500).json({
//         code: 1,
//         data: {},
//         msg: e.message.toString(),
//       })
//     }
//   });
// });

// // 用户登录，生成token
// router.post('/login', urlencodedParser, async (req, res) => {
//   const { username, password } = req.body;
//   const encryptedPw = md5(md5(username + md5(password))); // 获取加密后的password
//   const checkUsername = `select soulUsername from soulUserInfo where binary soulUsername = '${username}'`;
//   const checkUserInfo = `select * from soulUserInfo where binary soulUsername = '${username}' and binary soulPassword = '${encryptedPw}'`;
//   query(checkUsername, 'userInfo')
//   .then(result => {
//     if (!result || result.length === 0) {
//       throw new Error('username error');
//     } else {
//       return query(checkUserInfo, 'userInfo');
//     }
//   })
//   .then(result => {
//     if (!result || result.length === 0) {
//       throw new Error('password error');
//     } else if (result.length > 1) {
//       throw new Error('already register');
//     } else {
//       const { soulUsername, soulUuid, soulEmail, soulSignature, soulBirth } = result[0];
//       const userInfo = {
//         username: soulUsername,
//         uid: soulUuid,
//         signature: soulSignature,
//         birth: soulBirth,
//         email: soulEmail,
//       }
//       return setToken(userInfo);
//     }
//   })
//   .then(result => {
//     res.json({
//       code: 0,
//       data: result,
//       msg: 'login success',
//     });
//   })
//   .catch(e => {
//     if (e.message === 'username error') {
//       res.status(500).json({
//         code: 2,
//         data: {},
//         msg: 'username error'
//       });
//     } else if (e.message === 'password error') {
//       res.status(500).json({
//         code: 3,
//         data: {},
//         msg: 'password error'
//       });
//     } else if (e.message === 'already register') {
//       res.status(500).json({
//         code: 4,
//         data: {},
//         msg: 'already register',
//       })
//     } else {
//       res.status(500).json({
//         code: 1,
//         data: {},
//         msg: e.message.toString(),
//       })
//     }
//   })
// })

// 注册用户
router.post('/register', urlencodedParser, async (req, res) => {
  passport.authenticate('register', (err, user, info) => {
    if (err) {
      console.error('Error: ', err);
      res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    } else if (info) {
      console.error(info.message);
      res.status(403).json({
        code: 2,
        data: {},
        msg: info.message,
      });
    } else {
      req.logIn(user, error => {
        const { email, createTime } = req.body;
        const data = {
          username: user.soulUsername,
          email,
          createTime,
        };
        console.log('Data: ', data);
        const searchUsername = `select * from soulUserInfo where binary soulUsername = '${data.username}'`;

        query(searchUsername)
        .then(user => {
          console.log('User: ', user);
          const updateUser = `update soulUserInfo set soulEmail = '${data.email}', soulCreateTime = '${data.createTime}' where soulUsername = '${data.username}'`;
          return query(updateUser);
        })
        .then(() => {
          console.log('user created');
          res.status(200).json({
            code: 0,
            data: {},
            msg: 'user created',
          });
        })
        .catch(e => {
          console.error('Error: ', e);
          res.status(500).json({
            code: 1,
            data: {},
            msg: e.message.toString(),
          });
        })
      });
    }
  })(req, res);
});

// 用户名密码登录
router.post('/login', urlencodedParser, (req, res) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) {
      console.error('Error: ', err);
      res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    } else if (info) {
      console.error(info.message);
      if (info.message === 'bad username') {
        res.status(401).json({
          code: 2,
          data: {},
          msg: info.message,
        });
      } else {
        res.status(403).json({
          code: 3,
          data: {},
          msg: info.message,
        });
      }
    } else {
      req.logIn(user, async () => {
        const { soulUsername, soulUuid, soulEmail, soulSignature, soulBirth } = user;
        const userInfo = {
          username: soulUsername,
          uid: soulUuid,
          signature: soulSignature,
          birth: soulBirth,
          email: soulEmail,
        }
        const token = await setToken(userInfo);
        res.status(200).json({
          code: 0,
          data: token,
          msg: 'user found & logged in',
        });
      });
    }
  })(req, res);
});

// 发送验证码
router.post('/sendVerifyCode', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      code: 400,
      data: {},
      msg: 'email require',
    });
  } else {
    console.log('Email: ', email);
    const searchEmail = `select * from soulUserInfo where binary soulEmail = '${email}'`;
    query(searchEmail)
    .then(user => {
      if (!user || user.length === 0) {
        res.status(403).json({
          code: 3,
          data: {},
          msg: 'email not in db',
        });
      } else {
        const checkEmail = `select * from loginVerifyCode where email = '${email}'`;
        return query(checkEmail);
      }
    })
    .then(result => {
      const verifyCode = md5(uuidv4()).slice(0, 6).toLowerCase(); // 生成一个6位数的验证码
      const verifyCodeMd5 = md5(md5(email + md5(verifyCode))); // 使用md5再次加密
      const expireTime = (dayjs(new Date()).valueOf() + 60000).toString(); // 60s过期时间

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`,
        },
      });

      const mailOptions = {
        from: `${process.env.EMAIL_ADDRESS}`,
        to: `${email}`,
        subject: 'Soul-Harbor-Here is your login verification code',
        html: `<div>
                <div>Your login verification code is:</div>
                <br/>
                <h2>${verifyCode}</h2>
                <br/>
                <div>Please use your login verification code within 60 seconds, otherwise it will be invalid</div>
              </div>`,
      };

      console.log('sending mail');

      if (!result || result.length === 0) {
        // 新增验证码
        bcrypt.hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
        .then(hashedVerifyCode => {
          const insertVerifyCode = `insert into loginVerifyCode (email, verifyCode, expireTime) values ('${email}', '${hashedVerifyCode}', '${expireTime}')`;
          return query(insertVerifyCode);
        })
        .then(() => {
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              console.error('Error: ', err);
              res.status(500).json({
                code: 1,
                data: {},
                msg: 'Failed to send verification code',
              });
            } else {
              console.log('here is the res: ', response);
              res.status(200).json({
                code: 0,
                data: {},
                msg: 'Success to send verification code',
              });
            }
          });
        });
      } else {
        // 更新验证码
        bcrypt.hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
        .then(hashedVerifyCode => {
          const updateVerifyCode = `update loginVerifyCode set verifyCode = '${hashedVerifyCode}', expireTime = '${expireTime}' where email = '${email}'`;
          return query(updateVerifyCode);
        })
        .then(() => {
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              console.error('Error: ', err);
              res.status(500).json({
                code: 1,
                data: {},
                msg: 'Failed to send verification code',
              });
            } else {
              console.log('here is the res: ', response);
              res.status(200).json({
                code: 0,
                data: {},
                msg: 'Success to send verification code',
              });
            }
          });
        });
      }
    })
    .catch(e => {
      res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      });
    });
  }
});

// 邮箱验证码登录
router.post('/loginByEmail', urlencodedParser, (req, res) => {
  passport.authenticate('loginByEmail', (err, user, info) => {
    if (err) {
      console.error('Error: ', err);
      res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    } else if (info) {
      console.error(info.message);
      if (info.message === 'bad email') {
        res.status(401).json({
          code: 2,
          data: {},
          msg: info.message,
        });
      } else {
        res.status(403).json({
          code: 3,
          data: {},
          msg: info.message,
        });
      }
    } else {
      req.logIn(user, async () => {
        const { soulUsername, soulUuid, soulEmail, soulSignature, soulBirth } = user;
        const userInfo = {
          username: soulUsername,
          uid: soulUuid,
          signature: soulSignature,
          birth: soulBirth,
          email: soulEmail,
        }
        const token = await setToken(userInfo);
        res.status(200).json({
          code: 0,
          data: token,
          msg: 'user found & logged in',
        });
      });
    }
  })(req, res);
});

// 初始化，验证token
router.get('/init', function(req, res) {
  res.status(200).json({
    code: 0,
    data: {
      userInfo: _.pick(req.user, ['username', 'uid', 'email', 'signature', 'birth']),
    },
    msg: 'init success',
  });
})

export default router;
