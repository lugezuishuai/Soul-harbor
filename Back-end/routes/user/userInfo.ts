import express from 'express';
import bodyParser from 'body-parser';
import query from '../../models/query';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import passport from 'passport';
import { setToken } from '../../config/token/token';
import * as _ from 'lodash';
import { transporter } from '../../config/nodemailer';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import { breakPromise } from '../../utils/breakPromise';
import crypto from 'crypto';

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据
const BCRYPT_SALT_ROUNDS = 12;

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
        code: 3,
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
        });
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

// 发送注册的验证码
router.post('/sendRegisterVerifyCode', (req, res) => {
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
      if (user.length > 0) {
        res.status(403).json({
          code: 3,
          data: {},
          msg: 'email already taken',
        });
        return breakPromise();
      } else {
        const checkEmail = `select * from registerVerifyCode where binary email = '${email}'`;
        return query(checkEmail);
      }
    })
    .then(result => {
      const verifyCode = md5(uuidv4()).slice(0, 6).toLowerCase(); // 生成一个6位数的验证码
      const verifyCodeMd5 = md5(md5(email + md5(verifyCode))); // 使用md5再次加密
      const expireTime = (dayjs(new Date()).valueOf() + 60000).toString(); // 60s过期时间

      const mailOptions = {
        from: `${process.env.EMAIL_ADDRESS}`,
        to: `${email}`,
        subject: 'Soul-Harbor-Here is your register verification code',
        html: `<div>
                <h1>Your register verification code is:</h1>
                <br/>
                <h2>${verifyCode}</h2>
                <br/>
                <div>Please use your register verification code within 60 seconds, otherwise it will be invalid</div>
              </div>`,
      };

      console.log('sending mail');

      if (!result || result.length === 0) {
        // 新增验证码
        bcrypt.hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
        .then(hashedVerifyCode => {
          const insertVerifyCode = `insert into registerVerifyCode (email, verifyCode, expireTime) values ('${email}', '${hashedVerifyCode}', '${expireTime}')`;
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
          const updateVerifyCode = `update registerVerifyCode set verifyCode = '${hashedVerifyCode}', expireTime = '${expireTime}' where email = '${email}'`;
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
      if (!e.notRealPromiseException) {
        res.status(500).json({
          code: 1,
          data: {},
          msg: e.message.toString(),
        });
      }
    });
  }
});

// 忘记密码
router.post('/forgetPassword', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      code: 400,
      data: {},
      msg: 'email required',
    });
  } else {
    const searchEmail = `select * from soulUserInfo where binary soulEmail = '${email}'`;
    query(searchEmail)
    .then(user => {
      if (!user || user.length === 0) {
        res.status(403).json({
          code: 3,
          data: {},
          msg: 'email not in db',
        });
        return breakPromise();
      } else {
        const checkEmail = `select * from forgetPwToken where binary email = '${email}'`;
        return query(checkEmail);
      }
    })
    .then(result => {
      const token = crypto.randomBytes(20).toString('hex'); // 生成一个随机的令牌
      const expireTime = (dayjs(new Date()).valueOf() + 300000).toString(); // 5min过期时间

      const mailOptions = {
        from: `${process.env.EMAIL_ADDRESS}`,
        to: `${email}`,
        subject: 'Soul-Harbor-This is the link to reset your password',
        html: `<div>
                <h1>The link to reset your password is:</h1>
                <br/>
                <a href="http://localhost:5000/reset/${token}" target="_blank">http://localhost:5000/reset/${token}</a>
                <br/>
                <div>This link is valid for 5 minutes. Please enter this link within 5 minutes to reset your password</div>
              </div>`,
      };

      console.log('send email');

      if (!result || result.length === 0) {
        // 新增链接令牌
        bcrypt.hash(token, BCRYPT_SALT_ROUNDS)
        .then(hashedToken => {
          const insertToken = `insert into forgetPwToken (email, token, expireTime) values ('${email}', '${hashedToken}', '${expireTime}')`;
          return query(insertToken);
        })
        .then(() => {
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              console.error('Error: ', err);
              res.status(500).json({
                code: 1,
                data: {},
                msg: 'Failed to send forgetPw token',
              });
            } else {
              console.log('here is the res: ', response);
              res.status(200).json({
                code: 0,
                data: {},
                msg: 'Success to send forgetPw token',
              });
            }
          });
        });
      } else {
        // 更新链接令牌
        bcrypt.hash(token, BCRYPT_SALT_ROUNDS)
        .then(hashedToken => {
          const updateToken = `update forgetPwToken set token = '${hashedToken}', expireTime = '${expireTime}' where binary email = '${email}'`;
          return query(updateToken);
        })
        .then(() => {
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              console.error('Error: ', err);
              res.status(500).json({
                code: 1,
                data: {},
                msg: 'Failed to send forgetPw token',
              });
            } else {
              console.log('here is the res: ', response);
              res.status(200).json({
                code: 0,
                data: {},
                msg: 'Success to send forgetPw token',
              });
            }
          });
        });
      }
    })
    .catch(e => {
      if (!e.notRealPromiseException) {
        res.status(500).json({
          code: 1,
          data: {},
          msg: e.message.toString(),
        });
      }
    });
  }
});

// 检查忘记密码token是否有效
router.get('/checkTokenValid', (req, res) => {
  const { resetPasswordToken, email } = req.query;
  const searchTokenAndUser = `select soulUserInfo.soulUsername, forgetPwToken.token, forgetPwToken.expireTime from soulUserInfo, forgetPwToken where binary email = '${email}'`;
  query(searchTokenAndUser)
  .then(result => {
    if (!result || result.length === 0) {
      res.status(403).json({
        code: 3,
        data: {},
        msg: 'no valid link or link expired',
      });
    } else {
      resetPasswordToken && 
      bcrypt.compare(resetPasswordToken.toString(), result[0].token)
      .then(response => {
        if (!response) {
          res.status(403).json({
            code: 3,
            data: {},
            msg: 'no valid link or link expired',
          });
        } else {
          if (Number(result[0].expireTime) >= dayjs(new Date()).valueOf()) {
            res.status(200).json({
              code: 0,
              data: {
                username: result[0].soulUsername,
              },
              msg: 'password reset link a-ok',
            });
          } else {
            res.status(403).json({
              code: 3,
              data: {},
              msg: 'no valid link or link expired',
            });
          }
        }
      });
    }
  })
  .catch(e => {
    console.error(e);
    res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  });
});

// 重新设置密码
router.post('/updatePassword', (req, res) => {
  const { username, password } = req.body;
  const searchUserInfo = `select soulUserInfo.soulUsername, forgetPwToken.token, forgetPwToken.expireTime from soulUserInfo, forgetPwToken where soulUserInfo.email = forgetPwToken.email`;
  query(searchUserInfo)
  .then(result => {
    if (!result || result.length === 0) {
      res.status(403).json({
        code: 3,
        data: {},
        msg: 'no valid link or link expired',
      });
    } else {
      if (username === result[0].soulUsername && Number(result[0].expireTime) >= dayjs(new Date()).valueOf()) {
        // 链接没有失效
        bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
        .then(hashedPassword => {
          const updatePassword = `update soulUserInfo, forgetPwToken set soulUserInfo.soulUsername = '${username}', soulUserInfo.soulPassword = '${hashedPassword}', forgetPwToken.token = '', forgetPwToken.expireTime = '' where soulUserInfo.email = forgetPwToken.email`;
          return query(updatePassword);
        })
        .then(() => {
          res.status(200).json({
            code: 0,
            data: {},
            msg: 'update password success',
          });
        })
      } else {
        res.status(403).json({
          code: 3,
          data: {},
          msg: 'no valid link or link expired',
        });
      }
    }
  })
  .catch(e => {
    console.error(e);
    res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  });
});

// 发送登录验证码
router.post('/sendLoginVerifyCode', (req, res) => {
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
        return breakPromise();
      } else {
        const checkEmail = `select * from loginVerifyCode where binary email = '${email}'`;
        return query(checkEmail);
      }
    })
    .then(result => {
      const verifyCode = md5(uuidv4()).slice(0, 6).toLowerCase(); // 生成一个6位数的验证码
      const verifyCodeMd5 = md5(md5(email + md5(verifyCode))); // 使用md5再次加密
      const expireTime = (dayjs(new Date()).valueOf() + 60000).toString(); // 60s过期时间

      const mailOptions = {
        from: `${process.env.EMAIL_ADDRESS}`,
        to: `${email}`,
        subject: 'Soul-Harbor-Here is your login verification code',
        html: `<div>
                <h1>Your login verification code is:</h1>
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
          const updateVerifyCode = `update loginVerifyCode set verifyCode = '${hashedVerifyCode}', expireTime = '${expireTime}' where binary email = '${email}'`;
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
      if (!e.notRealPromiseException) {
        res.status(500).json({
          code: 1,
          data: {},
          msg: e.message.toString(),
        });
      }
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
});

// 退出登录
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/api/user/init');
});

export default router;
