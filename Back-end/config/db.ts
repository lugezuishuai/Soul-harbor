import { PoolConfig } from "mysql";

// 数据库相关配置
export const employeeDbConfig: PoolConfig = {
  host: process.env.DBHOST || 'localhost',
  port: process.env.DBPORT as any || 3306,
  user: process.env.DBUSER || 'jackson',
  password: process.env.DBPASSWORD || '000008053927',
  database: process.env.DATABASE_1 || 'employee_system',
};

// soul-harbor相关
export const userInfoDbConfig: PoolConfig = {
  host: process.env.DBHOST || 'localhost',
  port: process.env.DBPORT as any || 3306,
  user: process.env.DBUSER || 'jackson',
  password: process.env.DBPASSWORD || '000008053927',
  database: process.env.DATABASE_2 || 'soul-harbor',
};
