import logger from 'morgan';
import path from 'path';
import fse from 'fs-extra';
// @ts-ignore
import fileStreamRotator from 'file-stream-rotator';
import { isDevelopment } from '../config/constant';

export function getAccessLogStream(type: 'normal' | 'error' = 'normal') {
  try {
    const logDirectory = path.resolve(__dirname, '../logs'); // 日志文件的目录
    fse.existsSync(logDirectory) || fse.mkdirSync(logDirectory);

    return fileStreamRotator.getStream({
      filename: path.resolve(logDirectory, type === 'normal' ? 'access-%DATE%.log' : 'access-err-%DATE%.log'),
      frequency: 'custom',
      verbose: false,
      date_format: 'YYYY-MM-DD',
      size: '5M', // 限制文件大小为5M
      max_logs: '10d', // 最长保留10天的日志
    });
  } catch (e: any) {
    isDevelopment && console.error(e);
  }
}

// 普通日志
export const accessLog = logger('combined', { stream: getAccessLogStream() });

// 错误日志（4xx、5xx）
export const accessLogErr = logger('combined', {
  stream: getAccessLogStream('error'),
  skip: function (req, res) {
    return res.statusCode < 400;
  },
});

export const accessLogDev = logger('dev');
