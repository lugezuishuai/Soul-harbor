import { PoolConfig } from 'mysql';
import dotenv from 'dotenv';
import { ClientOpts } from 'redis';
import { ENV_PATH } from './constant';
dotenv.config({ path: ENV_PATH });

// 数据库相关配置
export const mysqlDbConfig: PoolConfig = {
  host: process.env.SERVICE_IP || 'localhost',
  port: Number(process.env.SQL_PORT) || 3306,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
};

// redis 相关
export const redisConfig: ClientOpts = {
  host: process.env.SERVICE_IP || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}
