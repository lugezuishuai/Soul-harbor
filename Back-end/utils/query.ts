import mysql from 'mysql';
import { mysqlDbConfig } from '../config/db';

// 注意：连接池要放在最外面
const soulHarborPool = mysql.createPool(mysqlDbConfig);

export function query(sql: string, values?: any) {
  return new Promise<any>((resolve, reject) => {
    soulHarborPool.getConnection((error, connection) => {
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
