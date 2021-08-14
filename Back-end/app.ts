import createError from 'http-errors';
import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import expressJWT from 'express-jwt';
import passport from 'passport';
import csrf from 'csurf';
import compression from 'compression';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import md5 from 'md5';
import rateLimit from 'express-rate-limit';

import { jwtSecret } from './config/token/token';
import { notTokenPath } from './config/token/path';
import indexRouter from './routes/index';
import userRouter from './routes/user'; // 用户相关
import fileRouter from './routes/file'; // 文件相关
import chatRouter from './routes/chat'; // 聊天相关
import employeeRouter from './routes/employee';
import { getIPAddress } from './utils/getIPAddress';
import os from 'os';
import dotenv from 'dotenv';
import { logger, accessLog, accessLogErr } from './helpers/logger';
import './config/passport';

dotenv.config({ path: '.env' });

const { sliceFileUpload } = fileRouter;
const { userInfo } = userRouter;
const { chat } = chatRouter;

const app = express();

// 限制请求数量5分钟内为100个
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later!',
});

// 注册账号请求限制在1h5个
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: 'Too many accounts created from this IP, please try again after an hour',
});

function shouldCompress(req: Request, res: Response) {
  if (req.headers['x-no-compression']) {
    // 这里就过滤掉了请求头包含'x-no-compression'
    return false;
  }

  return compression.filter(req, res);
}

app.disable('x-powered-by');
// 启用压缩
app.use(compression({ filter: shouldCompress }));
app.use(helmet());
// 设置跨域（使用中间件）
app.use(
  cors({
    origin: `http://${process.env.SERVICE_IP || getIPAddress(os.networkInterfaces())}`, // Access-Control-Allow-Origin
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], // Access-Control-Allow-Methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Access-Control-Request-Headers
    preflightContinue: false, // Pass the CORS preflight response to the next handler
    optionsSuccessStatus: 200, // Provides a status code to use for successful OPTIONS requests
  })
);

// // 配置响应头
// app.all('*', function (req, res, next) {
//   res.header(
//     'Access-Control-Allow-Origin',
//     `http://${process.env.SERVICE_IP || getIPAddress(os.networkInterfaces())}:${process.env.FRONT_END_PORT || 5000}`
//   );
//   res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'content-type,Authorization,X-Requested-With');
//   // res.header("X-Powered-By", ' 3.2.1');
//   // res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

// 验证token是否过期并规定那些路由不需要验证
app.use(
  expressJWT({
    secret: jwtSecret,
    algorithms: ['HS256'],
  }).unless({
    path: notTokenPath,
  })
);

app.set('trust proxy', true);
app.use('/api/', apiLimiter);
app.use('/api/user/register', createAccountLimiter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 处理日志
if (process.env.NODE_ENV === 'development') {
  // 开发环境打印日志不保存
  app.use(logger('dev'));
} else {
  app.use(accessLog);
  app.use(accessLogErr);
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: 'soul-harbor',
    keys: [md5('soul'), md5('harbor')],
    maxAge: 24 * 60 * 60 * 1000, // 有效时间为24小时
    httpOnly: true,
    path: '/',
  })
);
app.use(csrf({ cookie: { httpOnly: true, path: '/' }, ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] })); // CSRF防御
app.use(passport.initialize()); // 初始化passport

app.use('/', indexRouter);
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/api/user', userInfo);
app.use('/api/employee', employeeRouter);
app.use('/api/file', sliceFileUpload);
app.use('/api/chat', chat);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler(错误处理中间件)
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // 打印当前的环境
  console.log('environment: ', req.app.get('env'));
  if (err.name === 'UnauthorizedError') {
    // 返回401状态码
    return res.status(401).json({
      code: 1,
      data: {},
      msg: 'invalid token',
    });
  } else if (err.code === 'EBADCSRFTOKEN') {
    // 返回403状态码
    return res.status(403).json({
      code: 403,
      data: {},
      msg: 'csrf token check failed',
    });
  } else if (req.xhr) {
    // 返回500状态码
    return res.status(500).json({
      code: 500,
      data: {},
      msg: 'system error',
    });
  } else {
    return next(err);
  }
} as express.ErrorRequestHandler);

export default app;
