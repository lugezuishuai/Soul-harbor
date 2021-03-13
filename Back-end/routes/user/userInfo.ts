import express from 'express';
import bodyParser from 'body-parser';
import query from '../../models/query';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import { setToken } from '../../token/token';
import * as _ from 'lodash';

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据

// 注册用户
router.post('/register', urlencodedParser, async (req, res) => {
  const { username, password, nickname,  createTime } = req.body;
  const uuid = uuidv4();
  const encryptedPw = md5(md5(username + md5(password)));
  const checkUsername = `select soulUsername from soulUserInfo where binary soulUsername = '${username}'`;
  const checkNickname = `select soulNickname from soulUserInfo where binary soulNickname = '${nickname}'`;
  const registerSql = `insert into soulUserInfo (soulUsername, soulPassword, soulNickname, soulCreateTime, soulUuid) values ('${username}', '${encryptedPw}', '${nickname}', '${createTime}', '${uuid}')`;
  query(checkUsername, 'userInfo')
  .then(result => {
    if (result.length > 0) {
      throw new Error('username already exists');
    } else {
      return query(checkNickname, 'userInfo');
    }
  })
  .then(result => {
    if (result.length > 0) {
      throw new Error('nickname already exists');
    } else {
      return query(registerSql, 'userInfo');
    }
  })
  .then(result => {
    res.json({
      code: 0,
      data: {
        key: result.insertId,
        id: result.insertId,
      },
      msg: 'register success',
    })
  })
  .catch(e => {
    if (e.message === 'username already exists') {
      res.status(500).json({
        code: 2,
        data: {},
        msg: 'username already exists',
      })
    } else if (e.message === 'nickname already exists') {
      res.status(500).json({
        code: 3,
        data: {},
        msg: 'nickname already exists',
      })
    } else {
      res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      })
    }
  });
});

// 用户登录，生成token
router.post('/login', urlencodedParser, async (req, res) => {
  const { username, password } = req.body;
  const encryptedPw = md5(md5(username + md5(password))); // 获取加密后的password
  const checkUsername = `select soulUsername from soulUserInfo where binary soulUsername = '${username}'`;
  const checkUserInfo = `select * from soulUserInfo where binary soulUsername = '${username}' and binary soulPassword = '${encryptedPw}'`;
  query(checkUsername, 'userInfo')
  .then(result => {
    if (!result || result.length === 0) {
      throw new Error('username error');
    } else {
      return query(checkUserInfo, 'userInfo');
    }
  })
  .then(result => {
    if (!result || result.length === 0) {
      throw new Error('password error');
    } else if (result.length > 1) {
      throw new Error('already register');
    } else {
      const { soulUsername, soulUuid, soulNickname, soulSignature, soulBirth } = result[0];
      const userInfo = {
        username: soulUsername,
        uid: soulUuid,
        signature: soulSignature,
        birth: soulBirth,
        nickname: soulNickname,
      }
      return setToken(userInfo);
    }
  })
  .then(result => {
    res.json({
      code: 0,
      data: result,
      msg: 'login success',
    });
  })
  .catch(e => {
    if (e.message === 'username error') {
      res.status(500).json({
        code: 2,
        data: {},
        msg: 'username error'
      });
    } else if (e.message === 'password error') {
      res.status(500).json({
        code: 3,
        data: {},
        msg: 'password error'
      });
    } else if (e.message === 'already register') {
      res.status(500).json({
        code: 4,
        data: {},
        msg: 'already register',
      })
    } else {
      res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      })
    }
  })
})

// 修改密码
router.post('/forgetPw', urlencodedParser, async (req, res) => {
  const { username, newPasswordAgain } = req.body;
  const encryptedPw = md5(md5(username + md5(newPasswordAgain))); // 获取加密后的password
  const checkUsername = `select * from soulUserInfo where binary soulUsername = '${username}'`;
})

// 初始化，验证token
router.get('/init', function(req, res) {
  res.status(200).json({
    code: 0,
    data: {
      userInfo: _.pick(req.user, ['username', 'uid', 'nickname', 'signature', 'birth']),
    },
    msg: 'init success',
  });
})

export default router;
