import express from 'express';
import bodyParser from 'body-parser';
import query from '../../models/query';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据

// 注册用户
router.post('/register', urlencodedParser, async (req, res) => {
  const { username = '', password = '', createTime = '' } = req.body;
  const uuid = uuidv4();
  const sql = `inset into employee (username, password, createTime, uuid) values ('${username}', '${password}', '${createTime}', '${uuid}')`;
  try {
    const result = await query(sql);
    res.json({
      code: 0,
      data: {
        key: result.insertId,
        id: result.insertId,
      },
      msg: 'register success',
    })
  } catch (e) {
    res.json({
      code: 1,
      msg: e.toString(),
    })
  }
});

export default router;