import { PoolConfig } from 'mysql';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// 数据库相关配置
export const employeeDbConfig: PoolConfig = {
  host: process.env.DBHOST || 'localhost',
  port: Number(process.env.DBPORT) || 3306,
  user: process.env.DBUSER || 'jackson',
  password: process.env.DBPASSWORD || '000008053927',
  database: process.env.DATABASE_1 || 'employee_system',
};

// soul-harbor相关
export const userInfoDbConfig: PoolConfig = {
  host: process.env.DBHOST || 'localhost',
  port: Number(process.env.DBPORT) || 3306,
  user: process.env.DBUSER || 'jackson',
  password: process.env.DBPASSWORD || '000008053927',
  database: process.env.DATABASE_2 || 'soul-harbor',
};
