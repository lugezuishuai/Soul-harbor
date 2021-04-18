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
import { SuccessCodeType } from './code-type';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fse from 'fs-extra';

const { alreadyExit, noMatch, expiredOrUnValid, badAccount } = SuccessCodeType;

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据
const BCRYPT_SALT_ROUNDS = 12;

// 头像上传
const AVATAR_PATH = path.resolve(__dirname, '../../avatar');
const acceptType = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/bmp'];
const avatarUpload = multer({
  dest: AVATAR_PATH,
  limits: {
    fileSize: 2048 * 1000, // 限制文件大小（2M)
    files: 1, // 限制文件数量
  },
  fileFilter: function (req, file, cb) {
    // 限制文件上传类型，仅可上传png格式图片
    if (acceptType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Please check avatar type'));
    }
  },
});

// 提取后缀名
const extractExt = (filename: string) => filename.slice(filename.lastIndexOf('.') + 1, filename.length);

// 上传头像
router.post('/avatar-upload', (req, res) => {
  avatarUpload.single('avatar')(req, res, (err: any) => {
    if (err) {
      return res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    }
    try {
      const file = req.file;
      const { userId } = req.body;
      const { mimetype, originalname } = file;
      const fileType = mimetype.split('/')[1] || extractExt(originalname); // 提取文件类型

      const newAvatarPath = path.resolve(AVATAR_PATH, `${userId}.${fileType}`);
      fse.renameSync(file.path, newAvatarPath); // 重写头像的路径

      const avatarUrl = `${'http://localhost:4001' + newAvatarPath}`;

      return res.status(200).json({
        code: 0,
        data: {
          src: avatarUrl,
        },
        msg: 'upload success',
      });
    } catch (e) {
      console.error('Error: ', e);
      return res.status(500).json({
        code: 1,
        data: {},
        msg: 'upload failed',
      });
    }
  });
});

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
      switch (info.message) {
        case 'username or email already taken':
          res.status(200).json({
            code: alreadyExit,
            data: {},
            msg: info.message,
          });
          break;
        case 'verifyCode do not match':
          res.status(200).json({
            code: noMatch,
            data: {},
            msg: info.message,
          });
          break;
        default:
          res.status(200).json({
            code: expiredOrUnValid,
            data: {},
            msg: info.message,
          });
      }
    } else {
      req.logIn(user, (error) => {
        const { email, createTime } = req.body;
        const data = {
          username: user.soulUsername,
          email,
          createTime,
        };
        console.log('Data: ', data);
        const searchUsername = `select * from soulUserInfo where binary soulUsername = '${data.username}'`;

        query(searchUsername)
          .then((user) => {
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
          .catch((e) => {
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
        res.status(200).json({
          code: badAccount,
          data: {},
          msg: info.message,
        });
      } else {
        res.status(200).json({
          code: noMatch,
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
        };
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
      .then((user) => {
        if (user.length > 0) {
          res.status(200).json({
            code: alreadyExit,
            data: {},
            msg: 'email already taken',
          });
          return breakPromise();
        } else {
          const checkEmail = `select * from registerVerifyCode where binary email = '${email}'`;
          return query(checkEmail);
        }
      })
      .then((result) => {
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
          bcrypt
            .hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
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
          bcrypt
            .hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
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
      .catch((e) => {
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
  const ipArr = req.connection.remoteAddress?.split(':');
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
      .then((user) => {
        if (!user || user.length === 0) {
          res.status(200).json({
            code: badAccount,
            data: {},
            msg: 'email not in db',
          });
          return breakPromise();
        } else {
          const checkEmail = `select * from forgetPwToken where binary email = '${email}'`;
          return query(checkEmail);
        }
      })
      .then((result) => {
        const token = crypto.randomBytes(20).toString('hex'); // 生成一个随机的令牌
        const expireTime = (dayjs(new Date()).valueOf() + 3600000).toString(); // 1h过期时间

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS}`,
          to: `${email}`,
          subject: 'Soul-Harbor-This is the link to reset your password',
          html: `<div>
                <h1>The link to reset your password is:</h1>
                <br/>
                <a href="http://localhost:5000/reset/${token}" target="_blank">http://localhost:5000/reset/${token}</a>
                <br/>
                <h2>Note: the IP address to send the link is:</h2>
                <br/>
                <h3>${ipArr && ipArr[ipArr.length - 1]}</h3>
                <br/>
                <div>This link is valid for 5 minutes. Please enter this link within 5 minutes to reset your password</div>
              </div>`,
        };

        console.log('send email');

        if (!result || result.length === 0) {
          // 新增链接令牌
          const insertToken = `insert into forgetPwToken (email, token, expireTime) values ('${email}', '${token}', '${expireTime}')`;
          query(insertToken).then(() => {
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
          const updateToken = `update forgetPwToken set token = '${token}', expireTime = '${expireTime}' where binary email = '${email}'`;
          query(updateToken).then(() => {
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
      .catch((e) => {
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
  const { resetPasswordToken } = req.query;
  const searchToken = `select * from forgetPwToken where token = '${resetPasswordToken}'`;
  query(searchToken)
    .then((result) => {
      if (!result || result.length === 0) {
        res.status(200).json({
          code: expiredOrUnValid,
          data: {},
          msg: 'no valid link or link expired',
        });
      } else {
        if (Number(result[0].expireTime) >= dayjs(new Date()).valueOf()) {
          const searchUsername = `select soulUsername from soulUserInfo where binary soulEmail = '${result[0].email}'`;
          query(searchUsername).then((username) => {
            res.status(200).json({
              code: 0,
              data: {
                username: username[0].soulUsername,
              },
              msg: 'password reset link a-ok',
            });
          });
        } else {
          res.status(200).json({
            code: expiredOrUnValid,
            data: {},
            msg: 'no valid link or link expired',
          });
        }
      }
    })
    .catch((e) => {
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
  const searchUserInfo = `select soulUserInfo.soulUsername, forgetPwToken.token, forgetPwToken.expireTime from soulUserInfo, forgetPwToken where binary soulUserInfo.soulEmail = forgetPwToken.email`;
  query(searchUserInfo)
    .then((result) => {
      if (!result || result.length === 0) {
        res.status(200).json({
          code: expiredOrUnValid,
          data: {},
          msg: 'no valid link or link expired',
        });
      } else {
        if (username === result[0].soulUsername && Number(result[0].expireTime) >= dayjs(new Date()).valueOf()) {
          // 链接没有失效
          bcrypt
            .hash(password, BCRYPT_SALT_ROUNDS)
            .then((hashedPassword) => {
              const updatePassword = `update soulUserInfo, forgetPwToken set soulUserInfo.soulUsername = '${username}', soulUserInfo.soulPassword = '${hashedPassword}', forgetPwToken.token = '', forgetPwToken.expireTime = '' where binary soulUserInfo.soulEmail = forgetPwToken.email`;
              return query(updatePassword);
            })
            .then(() => {
              res.status(200).json({
                code: 0,
                data: {},
                msg: 'update password success',
              });
            });
        } else {
          res.status(200).json({
            code: expiredOrUnValid,
            data: {},
            msg: 'no valid link or link expired',
          });
        }
      }
    })
    .catch((e) => {
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
      .then((user) => {
        if (!user || user.length === 0) {
          res.status(200).json({
            code: badAccount,
            data: {},
            msg: 'email not in db',
          });
          return breakPromise();
        } else {
          const checkEmail = `select * from loginVerifyCode where binary email = '${email}'`;
          return query(checkEmail);
        }
      })
      .then((result) => {
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
          bcrypt
            .hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
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
          bcrypt
            .hash(verifyCodeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
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
      .catch((e) => {
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
      switch (info.message) {
        case 'bad email':
          res.status(200).json({
            code: badAccount,
            data: {},
            msg: info.message,
          });
          break;
        case 'verifyCode do not match':
          res.status(200).json({
            code: noMatch,
            data: {},
            msg: info.message,
          });
          break;
        default:
          res.status(200).json({
            code: expiredOrUnValid,
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
        };
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
router.get('/init', function (req, res) {
  res.status(200).json({
    code: 0,
    data: {
      userInfo: _.pick(req.user, ['username', 'uid', 'email', 'signature', 'birth']),
    },
    msg: 'init success',
  });
});

// 退出登录
router.get('/logout', function (req, res) {
  req.logout();
  res.cookie('token', '', {
    path: '/',
    maxAge: -1,
  });

  res.json({
    code: 0,
    data: {},
    msg: 'success logout',
  });
});

export default router;
