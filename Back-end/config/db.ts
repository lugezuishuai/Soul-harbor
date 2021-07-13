import { PoolConfig } from 'mysql';
import dotenv from 'dotenv';
import { ClientOpts } from 'redis';
dotenv.config({ path: '.env' });

// 数据库相关配置
export const mysqlDbConfig: PoolConfig = {
  host: process.env.DBHOST || 'localhost',
  port: Number(process.env.DBPORT) || 3306,
  user: process.env.DBUSER || 'jackson',
  password: process.env.DBPASSWORD || '000008053927',
  database: process.env.DATABASE || 'soul-harbor',
};

// redis 相关
export const redisConfig: ClientOpts = {
  host: process.env.DBHOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || '000008053927',
};
