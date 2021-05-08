import mysql from 'mysql';
import { employeeDbConfig, userInfoDbConfig } from '../config/db';

type DbName = 'userInfo' | 'employee';

export default function query(sql: string, dbName: DbName = 'userInfo', values?: any) {
  const pool = mysql.createPool(dbName === 'userInfo' ? userInfoDbConfig : employeeDbConfig);
  return new Promise<any>((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
      } else {
        connection.query(sql, values, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
          connection.release();
        });
      }
    });
  });
}
