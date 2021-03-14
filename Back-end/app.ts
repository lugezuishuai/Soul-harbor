import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import expressJWT from 'express-jwt';

import { jwtSecret } from './config/token/token';
import { notTokenPath } from './config/token/path';
import indexRouter from './routes/index';
import userInfoRouter from './routes/user/userInfo'; // 用户信息相关
import employeeRouter from './routes/employee';
import passport from 'passport';
import './config/passport';

let app = express();

// 设置跨域（使用中间件）
app.use(cors()); // 配置全部跨域

// 配置请求头
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("X-Powered-By", ' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header("Access-Control-Allow-Headers", "content-type,Authorization,X-Requested-With");
  next();
});

// 验证token是否过期并规定那些路由不需要验证
app.use(expressJWT({
  secret: jwtSecret,
  algorithms:['HS256'],
}).unless({
  path: notTokenPath,
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize()); // 初始化passport

app.use('/', indexRouter);
app.use('/api/user', userInfoRouter);
app.use('/api/employee', employeeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler(错误处理中间件)
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (err.name === 'UnauthorizedError') {
    // 返回401状态码
    res.status(401).json({
      code: 1,
      data: {},
      msg: 'invalid token',
    })
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
} as express.ErrorRequestHandler);

export default app;