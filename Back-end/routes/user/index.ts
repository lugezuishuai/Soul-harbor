import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import * as handler from './handlers/index';
dotenv.config({ path: '.env' });

const {
  avatarUpload,
  changeBasicInfo,
  register,
  loginByUsername,
  sendRegisterVerifyCode,
  forgetPassword,
  checkTokenValid,
  updatePassword,
  sendLoginVerifyCode,
  loginByEmail,
  init,
  xsrf,
  logout,
} = handler;

const urlencodedParser = bodyParser.urlencoded({ extended: false }); // 解析form表单提交的数据
export const router = express.Router();
export const BCRYPT_SALT_ROUNDS = 12;

router.post('/avatar-upload', avatarUpload);
router.post('/basic-info', changeBasicInfo);
router.post('/register', urlencodedParser, register);
router.post('/login', urlencodedParser, loginByUsername);
router.post('/sendRegisterVerifyCode', sendRegisterVerifyCode);
router.post('/forgetPassword', forgetPassword);
router.get('/checkTokenValid', checkTokenValid);
router.post('/updatePassword', updatePassword);
router.post('/sendLoginVerifyCode', sendLoginVerifyCode);
router.post('/loginByEmail', loginByEmail);
router.get('/init', init);
router.get('/xsrf', xsrf);
router.get('/logout', logout);
