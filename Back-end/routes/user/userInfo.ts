import express from 'express';
import bodyParser from 'body-parser';
import query from '../../utils/query';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import passport from 'passport';
import { setToken } from '../../config/token/token';
import { transporter } from '../../config/nodemailer';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import { breakPromise } from '../../utils/breakPromise';
import { UnSuccessCodeType } from './code-type';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fse from 'fs-extra';
import os from 'os';
import schedule from 'node-schedule';
import rimraf from 'rimraf';
import { getIPAddress } from '../../utils/getIPAddress';
import { extractExt } from '../../utils/extractExt';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import { matchUrls } from '../../utils/matchUrl';
import { batchSetSessionsAvatar } from '../../utils/redis';
import { getDirectories } from '../../utils/getDirectories';
import { listFile } from '../../utils/listFile';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const { alreadyExit, noMatch, expiredOrUnValid, badAccount, invalidUuid } = UnSuccessCodeType;

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据
const BCRYPT_SALT_ROUNDS = 12;

// 头像上传
const AVATAR_PATH = path.resolve(__dirname, '../../public/user/avatar');
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

// 上传头像
router.post('/avatar-upload', async (req, res) => {
  try {
    if (!fse.existsSync(AVATAR_PATH)) {
      await fse.mkdir(AVATAR_PATH);
    }
    avatarUpload.single('avatar')(req, res, async (err: any) => {
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
        const hostIP = process.env.SERVICE_IP || getIPAddress(os.networkInterfaces()); // 获取主机IP地址
        const port = process.env.PORT || '4001'; // 获取当前的端口号

        const suffix = crypto.randomBytes(16).toString('hex'); // 生成16位随机的hash值作为后缀
        const tempAvatarDir = path.resolve(AVATAR_PATH, `${userId}`);
        const tempAvatarPath = path.resolve(tempAvatarDir, `${userId}-${suffix}.${fileType}`);

        if (!fse.existsSync(tempAvatarDir)) {
          await fse.mkdir(tempAvatarDir);
        }
        fse.renameSync(file.path, tempAvatarPath); // 重写头像的路径

        const avatarSrc = `http://${hostIP}:${port}/static/user/avatar/${userId}/${userId}-${suffix}.${fileType}`;

        schedule.scheduleJob(new Date(new Date().getTime() + 1800000), () => {
          // 临时文件夹的有效期为半个小时
          if (fse.existsSync(tempAvatarDir)) {
            rimraf(tempAvatarDir, (e) => {
              if (e) {
                console.error('Error: ', e);
              }
            });
          }
        });

        return res.status(200).json({
          code: 0,
          data: {
            src: avatarSrc,
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
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: 'upload failed',
    });
  }
});

// 修改用户信息
router.post('/basic-info', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const { userId, signature, birth } = req.body;
    let { avatar } = req.body;

    const soul_uuid = uuid || '',
      soul_signature = signature || '',
      soul_birth = birth || '';

    if (avatar) {
      if (!fse.existsSync(AVATAR_PATH)) {
        await fse.mkdir(AVATAR_PATH);
      }
      const avatarNameArr = avatar.split('/');
      const avatarName = avatarNameArr[avatarNameArr.length - 1];
      const tempAvatarPath = path.resolve(AVATAR_PATH, `${userId}`, `${avatarName}`); // 临时的图片路径
      const realAvatarPath = path.resolve(AVATAR_PATH, `${avatarName}`); // 真正的图片路径

      if (!fse.existsSync(realAvatarPath)) {
        if (!fse.existsSync(tempAvatarPath)) {
          return res.status(404).json({
            code: 404,
            data: {},
            msg: 'Image not found or expired',
          });
        }

        fse.copyFileSync(tempAvatarPath, realAvatarPath);
        const directoriesList = getDirectories(AVATAR_PATH); // 文件夹目录
        let filesList: string[] = [];
        directoriesList.forEach((dir) => {
          const files = listFile(dir);
          filesList = filesList.concat(files);
        });

        if (filesList.length > 0) {
          filesList.forEach((path) => {
            if (fse.existsSync(path)) {
              fse.unlink(path, (e) => {
                if (e) {
                  throw e;
                }
              });
            }
          });
        }

        const searchOldAvatar = `select soul_avatar from soul_user_info where soul_uuid = '${uuid}'`;
        const result: Array<any> = await query(searchOldAvatar);

        if (!result || result.length !== 1) {
          return res.status(400).json({
            code: invalidUuid,
            data: {},
            msg: 'invalid uuid',
          });
        }

        if (result[0]?.soul_avatar) {
          const oldAvatarFileArr = result[0].soul_avatar.split('/');
          const oldAvatarFileName = oldAvatarFileArr[oldAvatarFileArr.length - 1]; // 老头像的文件名
          const oldAvatarFilePath = path.resolve(AVATAR_PATH, oldAvatarFileName); // 老头像的文件路径

          if (fse.existsSync(oldAvatarFilePath)) {
            fse.unlink(oldAvatarFilePath, (e) => {
              if (e) {
                throw e;
              }
            });
          }
        }
      }
      avatar = getAvatarUrl(`/static/user/avatar/${avatarName}`);
    }

    // soul_user_info
    const updateBasicInfo = avatar
      ? `update soul_user_info set soul_avatar = '${avatar}', soul_signature = '${soul_signature}', soul_birth = '${soul_birth}' where soul_uuid = '${soul_uuid}'`
      : `update soul_user_info set soul_signature = '${soul_signature}', soul_birth = '${soul_birth}' where soul_uuid = '${soul_uuid}'`;

    const updateTbFriend = `update tb_friend set friend_avatar = '${avatar}' where friend_id = '${soul_uuid}'`;
    const updateTbPrivateChat = `update tb_private_chat set sender_avatar = '${avatar}' where sender_id = '${soul_uuid}'`;
    const updateTbRoomChat = `update tb_room_chat set sender_avatar = '${avatar}' where sender_id = '${soul_uuid}'`;
    const updateTbRoomMember = `update room_member set member_avatar = '${avatar}' where member_id = '${soul_uuid}'`;

    await query(updateBasicInfo);

    if (avatar) {
      await Promise.all([
        query(updateTbFriend),
        query(updateTbPrivateChat),
        query(updateTbRoomChat),
        query(updateTbRoomMember),
        batchSetSessionsAvatar(soul_uuid, avatar),
      ]);
    }
    return res.status(200).json({
      code: 0,
      data: {
        avatar,
      },
      msg: 'success update basic info',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

// 注册用户
router.post('/register', urlencodedParser, (req, res) => {
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
        case 'verify_code do not match':
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
      req.logIn(user, () => {
        const { email } = req.body;
        const data = {
          username: user.soul_username,
          email,
        };
        console.log('Data: ', data);
        const searchUsername = `select * from soul_user_info where binary soul_username = '${data.username}'`;

        query(searchUsername)
          .then((user) => {
            console.log('User: ', user);
            const updateUser = `update soul_user_info set soul_email = '${data.email}' where soul_username = '${data.username}'`;
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
        try {
          const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth } = user;
          let { soul_avatar } = user;

          if (soul_avatar) {
            const oldIPAddress = matchUrls(soul_avatar)?.address; // 防止因为网络发生变化导致ip地址发生变化
            const newIPAddress = process.env.SERVICE_IP || getIPAddress(os.networkInterfaces());

            if (oldIPAddress !== newIPAddress) {
              // 如果IP地址发生了改变，要修改头像链接的IP地址
              soul_avatar = soul_avatar.replace(oldIPAddress, newIPAddress);
              const updateAvatar = `update soul_user_info set soul_avatar = '${soul_avatar}' where soul_uuid = '${soul_uuid}'`;
              await query(updateAvatar);
            }
          }

          const userInfo = {
            username: soul_username,
            uid: soul_uuid,
            signature: soul_signature,
            birth: soul_birth,
            email: soul_email,
            avatar: soul_avatar,
          };
          const token = await setToken(userInfo);
          res.cookie('uuid', userInfo.uid);
          return res.status(200).json({
            code: 0,
            data: token,
            msg: 'user found & logged in',
          });
        } catch (e) {
          console.error('Error: ', e);
          return res.status(500).json({
            code: 1,
            data: {},
            msg: e.message.toString(),
          });
        }
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
    const searchEmail = `select * from soul_user_info where binary soul_email = '${email}'`;
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
          const checkEmail = `select * from register_verify_code where binary email = '${email}'`;
          return query(checkEmail);
        }
      })
      .then((result) => {
        const verify_code = md5(uuidv4()).slice(0, 6).toLowerCase(); // 生成一个6位数的验证码
        const verify_codeMd5 = md5(md5(email + md5(verify_code))); // 使用md5再次加密
        const expire_time = (dayjs(new Date()).valueOf() + 60000).toString(); // 60s过期时间

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS}`,
          to: `${email}`,
          subject: 'Soul-Harbor-Here is your register verification code',
          html: `<div>
                <h1>Your register verification code is:</h1>
                <br/>
                <h2>${verify_code}</h2>
                <br/>
                <div>Please use your register verification code within 60 seconds, otherwise it will be invalid</div>
              </div>`,
        };

        console.log('sending mail');

        if (!result || result.length === 0) {
          // 新增验证码
          bcrypt
            .hash(verify_codeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
              const insertVerifyCode = `insert into register_verify_code (email, verify_code, expire_time) values ('${email}', '${hashedVerifyCode}', '${expire_time}')`;
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
            .hash(verify_codeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
              const updateVerifyCode = `update register_verify_code set verify_code = '${hashedVerifyCode}', expire_time = '${expire_time}' where email = '${email}'`;
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
  const clientAddress =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || '';
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      code: 400,
      data: {},
      msg: 'email required',
    });
  } else {
    const searchEmail = `select * from soul_user_info where binary soul_email = '${email}'`;
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
          const checkEmail = `select * from forget_pw_token where binary email = '${email}'`;
          return query(checkEmail);
        }
      })
      .then((result) => {
        const token = crypto.randomBytes(20).toString('hex'); // 生成一个随机的令牌
        const expire_time = (dayjs(new Date()).valueOf() + 3600000).toString(); // 1h过期时间

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS}`,
          to: `${email}`,
          subject: 'Soul-Harbor-This is the link to reset your password',
          html: `<div>
                <h1>The link to reset your password is:</h1>
                <br/>
                <a href="http://${process.env.SERVICE_IP || 'localhost'}:${
            process.env.FRONT_END_PORT || 5000
          }/reset/${token}" target="_blank">http://${process.env.SERVICE_IP || 'localhost'}:${
            process.env.FRONT_END_PORT || 5000
          }/reset/${token}</a>
                <br/>
                <h2>Note: the IP address to send the link is:</h2>
                <br/>
                <h3>${clientAddress}</h3>
                <br/>
                <div>This link is valid for 5 minutes. Please enter this link within 5 minutes to reset your password</div>
              </div>`,
        };

        console.log('send email');

        if (!result || result.length === 0) {
          // 新增链接令牌
          const insertToken = `insert into forget_pw_token (email, token, expire_time) values ('${email}', '${token}', '${expire_time}')`;
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
          const updateToken = `update forget_pw_token set token = '${token}', expire_time = '${expire_time}' where binary email = '${email}'`;
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
  const searchToken = `select * from forget_pw_token where token = '${resetPasswordToken}'`;
  query(searchToken)
    .then((result) => {
      if (!result || result.length === 0) {
        res.status(200).json({
          code: expiredOrUnValid,
          data: {},
          msg: 'no valid link or link expired',
        });
      } else {
        if (Number(result[0].expire_time) >= dayjs(new Date()).valueOf()) {
          const searchUsername = `select soul_username from soul_user_info where binary soul_email = '${result[0].email}'`;
          query(searchUsername).then((username) => {
            res.status(200).json({
              code: 0,
              data: {
                username: username[0].soul_username,
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
router.post('/updatePassword', async (req, res) => {
  try {
    const { username, password, token } = req.body;
    const searchUserInfo = `select soul_user_info.soul_username, soul_user_info.soul_email, forget_pw_token.expire_time from soul_user_info, forget_pw_token where binary soul_user_info.soul_email = forget_pw_token.email and binary forget_pw_token.token = '${token}'`;
    const result = await query(searchUserInfo);

    if (!result || result.length !== 1) {
      return res.status(200).json({
        code: expiredOrUnValid,
        data: {},
        msg: 'no valid link or link expired',
      });
    } else {
      const { soul_username, expire_time, soul_email } = result[0];
      if (username === soul_username && Number(expire_time) >= dayjs(new Date()).valueOf()) {
        // 链接没有失效
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const updatePassword = `update soul_user_info set soul_username = '${username}', soul_password = '${hashedPassword}' where binary soul_email = '${soul_email}'`;
        await query(updatePassword);

        return res.status(200).json({
          code: 0,
          data: {},
          msg: 'update password success',
        });
      } else {
        // 链接已经失效
        return res.status(200).json({
          code: expiredOrUnValid,
          data: {},
          msg: 'no valid link or link expired',
        });
      }
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
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
    const searchEmail = `select * from soul_user_info where binary soul_email = '${email}'`;
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
          const checkEmail = `select * from login_verify_code where binary email = '${email}'`;
          return query(checkEmail);
        }
      })
      .then((result) => {
        const verify_code = md5(uuidv4()).slice(0, 6).toLowerCase(); // 生成一个6位数的验证码
        const verify_codeMd5 = md5(md5(email + md5(verify_code))); // 使用md5再次加密
        const expire_time = (dayjs(new Date()).valueOf() + 60000).toString(); // 60s过期时间

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS}`,
          to: `${email}`,
          subject: 'Soul-Harbor-Here is your login verification code',
          html: `<div>
                <h1>Your login verification code is:</h1>
                <br/>
                <h2>${verify_code}</h2>
                <br/>
                <div>Please use your login verification code within 60 seconds, otherwise it will be invalid</div>
              </div>`,
        };

        console.log('sending mail');

        if (!result || result.length === 0) {
          // 新增验证码
          bcrypt
            .hash(verify_codeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
              const insertVerifyCode = `insert into login_verify_code (email, verify_code, expire_time) values ('${email}', '${hashedVerifyCode}', '${expire_time}')`;
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
            .hash(verify_codeMd5, BCRYPT_SALT_ROUNDS)
            .then((hashedVerifyCode) => {
              const updateVerifyCode = `update login_verify_code set verify_code = '${hashedVerifyCode}', expire_time = '${expire_time}' where binary email = '${email}'`;
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
        case 'verify_code do not match':
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
        try {
          const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth } = user;
          let { soul_avatar } = user;

          if (soul_avatar) {
            const oldIPAddress = matchUrls(soul_avatar)?.address; // 防止因为网络发生变化导致ip地址发生变化
            const newIPAddress = process.env.SERVICE_IP || getIPAddress(os.networkInterfaces());

            if (oldIPAddress !== newIPAddress) {
              // 如果IP地址发生了改变，要修改头像链接的IP地址
              soul_avatar = soul_avatar.replace(oldIPAddress, newIPAddress);
              const updateAvatar = `update soul_user_info set soul_avatar = '${soul_avatar}' where soul_uuid = '${soul_uuid}'`;
              await query(updateAvatar);
            }
          }

          // if (!isNullOrUndefined(soul_avatar)) {
          //   const oldIPAddress = soul_avatar.match(/^http:\/\/(.*?):4001\/.*?/i)[1]; // 防止因为网络发生变化导致ip地址发生变化
          //   const newIPAddress = getIPAddress(os.networkInterfaces());

          //   if (oldIPAddress !== newIPAddress) {
          //     // 如果IP地址发生了改变，要修改头像链接的IP地址
          //     soul_avatar = soul_avatar.replace(oldIPAddress, newIPAddress);
          //     const updateAvatar = `update soul_user_info set soul_avatar = '${soul_avatar}' where soul_uuid = '${soul_uuid}'`;
          //     await query(updateAvatar);
          //   }
          // }

          const userInfo = {
            username: soul_username,
            uid: soul_uuid,
            signature: soul_signature,
            birth: soul_birth,
            email: soul_email,
            avatar: soul_avatar,
          };
          const token = await setToken(userInfo);
          res.cookie('uuid', userInfo.uid);
          return res.status(200).json({
            code: 0,
            data: token,
            msg: 'user found & logged in',
          });
        } catch (e) {
          console.error('Error: ', e);
          return res.status(500).json({
            code: 1,
            data: {},
            msg: e.message.toString(),
          });
        }
      });
    }
  })(req, res);
});

// 初始化，验证token
router.get('/init', async function (req, res) {
  try {
    // @ts-ignore
    const { uid } = req.user;
    const getUserInfo = `select soul_username, soul_uuid, soul_email, soul_signature, soul_birth, soul_avatar from soul_user_info where soul_uuid = '${uid}'`;
    const userInfo = await query(getUserInfo);
    if (!userInfo.length) {
      return res.status(400).json({
        code: 400,
        data: {},
        msg: 'client error',
      });
    }
    if (userInfo.length > 1) {
      throw new Error('invalid uuid');
    }
    const { soul_username, soul_uuid, soul_email, soul_signature, soul_birth } = userInfo[0];
    let { soul_avatar } = userInfo[0];

    if (soul_avatar) {
      const oldIPAddress = matchUrls(soul_avatar)?.address; // 防止因为网络发生变化导致ip地址发生变化
      const newIPAddress = process.env.SERVICE_IP || getIPAddress(os.networkInterfaces());

      if (oldIPAddress !== newIPAddress) {
        // 如果IP地址发生了改变，要修改头像链接的IP地址
        soul_avatar = soul_avatar.replace(oldIPAddress, newIPAddress);
        const updateAvatar = `update soul_user_info set soul_avatar = '${soul_avatar}' where soul_uuid = '${soul_uuid}'`;
        await query(updateAvatar);
      }
    }

    res.cookie('uuid', soul_uuid);
    return res.status(200).json({
      code: 0,
      data: {
        userInfo: {
          username: soul_username,
          uid: soul_uuid,
          email: soul_email,
          birth: soul_birth,
          signature: soul_signature,
          avatar: soul_avatar,
        },
      },
      msg: 'init success',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

// 设置xsrfToken
router.get('/xsrf', function (req, res) {
  res.status(200).json({
    code: 0,
    data: {},
    msg: 'xsrfToken init success',
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
