import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import expressJWT from 'express-jwt';
import passport from 'passport';
import csrf from 'csurf';

import { jwtSecret } from './config/token/token';
import { notTokenPath } from './config/token/path';
import indexRouter from './routes/index';
import userRouter from './routes/user'; // 用户相关
import fileRouter from './routes/file'; // 文件相关
import chatRouter from './routes/chat'; // 聊天相关
import employeeRouter from './routes/employee';
import { getIPAddress } from './utils/getIPAddress';
import os from 'os';
import './config/passport';

const { sliceFileUpload } = fileRouter;
const { userInfo } = userRouter;
const { chat } = chatRouter;

const app = express();

// 设置跨域（使用中间件）
app.use(cors()); // 配置全部跨域

// 配置响应头
app.all('*', function (req, res, next) {
  res.header(
    'Access-Control-Allow-Origin',
    `http://${getIPAddress(os.networkInterfaces()) || 'localhost'}:${process.env.FRONT_END_PORT || 5000}`
  );
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-type,Authorization,X-Requested-With');
  // res.header("X-Powered-By", ' 3.2.1');
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrf({ cookie: { httpOnly: true }, ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] })); // CSRF防御
app.use(function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrftoken = req.csrfToken();
  next();
});
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
  if (err.name === 'UnauthorizedError') {
    // 返回401状态码
    res.status(401).json({
      code: 1,
      data: {},
      msg: 'invalid token',
    });
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
} as express.ErrorRequestHandler);

export default app;
