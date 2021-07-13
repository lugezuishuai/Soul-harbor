import express from 'express';
import bodyParser from 'body-parser';
// @ts-ignore
import excelExport from 'excel-export';
import query from '../utils/query';

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据

const queryAllSQL = `select employee.*, level.level, department.department from employee, level, department where employee.levelId = level.id and employee.departmentId = department.id`;

// 查询员工信息
router.get('/getEmployee', async (req, res) => {
  const { name = '', departmentId } = req.query;
  let conditions = `and employee.name like '%${name}%'`; // 模糊搜索
  if (departmentId) {
    conditions = conditions + `and employee.departmentId=${departmentId}`; // 按照部门搜索
  }
  const sql = `${queryAllSQL} ${conditions} order by employee.id desc`; // 根据id降序排序
  try {
    const result = await query(sql);
    result.forEach((i: any) => {
      i.key = i.id;
    });
    res.json({
      code: 0,
      data: result,
      msg: 'success',
    });
  } catch (e) {
    res.json({
      code: 1,
      msg: e.toString(),
    });
  }
});

// 创建新员工
router.post('/createEmployee', urlencodedParser, async (req, res) => {
  const { name, departmentId, hiredate, levelId } = req.body;
  const sql = `insert into employee (name, departmentId, hiredate, levelId) values ('${name}', ${departmentId}, '${hiredate}', ${levelId})`;
  try {
    const result = await query(sql);
    res.json({
      code: 0,
      data: {
        key: result.insertId,
        id: result.insertId,
      },
      msg: 'success',
    });
  } catch (e) {
    res.json({
      code: 1,
      msg: e.toString(),
    });
  }
});

// 删除员工
router.post('/deleteEmployee', async (req, res) => {
  const { id } = req.body;
  const sql = `delete from employee where id=${id}`;
  try {
    await query(sql);
    res.json({
      code: 0,
      msg: 'success',
    });
  } catch (e) {
    res.json({
      code: 1,
      msg: e.toString(),
    });
  }
});

// 更新员工信息
router.post('/updateEmployee', async (req, res) => {
  const { id, name, departmentId, hiredate, levelId } = req.body;
  const sql = `update employee set name='${name}', departmentId=${departmentId}, hiredate='${hiredate}', levelId=${levelId} where id=${id}`;
  try {
    await query(sql);
    res.json({
      code: 0,
      msg: 'success',
    });
  } catch (e) {
    res.json({
      code: 1,
      msg: e.toString(),
    });
  }
});

// 导出的Excel表格的配置信息
const conf: excelExport.Config = {
  cols: [
    { caption: '员工ID', type: 'number' },
    { caption: '姓名', type: 'string' },
    { caption: '部门', type: 'string' },
    { caption: '入职时间', type: 'string' },
    { caption: '职级', type: 'string' },
  ],
  rows: [],
};

// 导出excel表格
router.get('/downloadEmployee', async (req, res) => {
  try {
    const result = await query(queryAllSQL);
    conf.rows = result.map((i: any) => {
      return [i.id, i.name, i.department, i.hiredate, i.level];
    });
    const excel = excelExport.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx');
    res.end(excel, 'binary');
  } catch (e) {
    res.send(e.toString());
  }
});

export default router;
