import mysql from 'mysql';
import { employeeDbConfig, userInfoDbConfig } from '../config/db';


type DbName = 'userInfo' | 'employee';

const query = (sql: string, dbName: DbName = 'employee') => {
  const pool = mysql.createPool(dbName === 'employee' ? employeeDbConfig : userInfoDbConfig);
  return new Promise<any>((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if(error) {
        reject(error);
      } else {
        connection.query(sql, (error, results) => {
          if(error) {
            reject(error);
          } else {
            resolve(results);
          }
          connection.release();
        })
      }
    })
  })
};

export default query;