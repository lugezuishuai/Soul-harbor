import express from 'express';
import bodyParser from 'body-parser';
import query from '../../models/query';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import { setToken } from '../../token/token';

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
      res.status(500).json({
        code: 2,
        data: {},
        msg: 'username already exists',
      })
      throw new Error('username already exists');
    } else {
      return query(checkNickname, 'userInfo');
    }
  })
  .then(result => {
    if (result.length > 0) {
      res.status(500).json({
        code: 3,
        data: {},
        msg: 'nickname already exists',
      })
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
    if (e.message !== 'username already exists' && e.message !== 'nickname already exists') {
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
      res.status(500).json({
        code: 2,
        data: {},
        msg: 'username or password error'
      });
      throw new Error('username or password error');
    } else {
      return query(checkUserInfo, 'userInfo');
    }
  })
  .then(result => {
    if (!result || result.length === 0) {
      res.status(500).json({
        code: 2,
        data: {},
        msg: 'username or password error'
      });
      throw new Error('username or password error');
    } else if (result.length > 1) {
      res.status(500).json({
        code: 3,
        data: {},
        msg: 'already register',
      })
      throw new Error('already register');
    } else {
      const uuid = result['soulUuid'];
      return setToken(username, uuid);
    }
  })
  .then(result => {
    res.json({
      code: 0,
      data: {
        token: result,
      },
      msg: 'login success',
    });
  })
  .catch(e => {
    if (e.message === 'token is empty') {
      res.status(400).json({
        code: 1,
        data: {},
        msg: 'token is empty',
      })
    } else if (e.message !== 'username or password error' && e.message !== 'already register') {
      res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      })
    }
  })
})

// 初始化，验证token
router.get('/init', function(req, res) {
  console.log('token', req.user);

  res.status(200).json({
    code: 0,
    data: req.user,
    msg: 'init success',
  });
})

export default router;
