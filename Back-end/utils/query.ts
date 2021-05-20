import mysql from 'mysql';
import { employeeDbConfig, userInfoDbConfig } from '../config/db';

type DbName = 'userInfo' | 'employee';

// 注意：连接池要放在最外面
const userInfoPool = mysql.createPool(userInfoDbConfig);
const employeePool = mysql.createPool(employeeDbConfig);

export default function query(sql: string, dbName: DbName = 'userInfo', values?: any) {
  const pool = dbName === 'userInfo' ? userInfoPool : employeePool;
  return new Promise<any>((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        console.log('query connect error!', error);
      } else {
        connection.query(sql, values, (error, rows) => {
          // 释放数据库连接
          connection.release();

          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
        });
      }
    });
  });
}
