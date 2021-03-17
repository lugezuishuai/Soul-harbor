import React, { ReactNode, useState } from 'react';
import { Form, Modal, Button, message, Icon, Menu } from 'antd';
import close from '@/assets/icon/close.svg';
import closeMobile from '@/assets/icon/close_mobile.svg';
import { screen } from '@/constants/screen';
import { FormComponentProps } from 'antd/lib/form';
import { Login } from './login';
import { Register } from './register';
import { ForgetPw } from './forgetPw';
import md5 from 'md5';
import dayjs from 'dayjs';
import { REGISTER_URL, USERNAMELOGIN_URL, EMAILLOGIN_URL } from '@/constants/urls';
import { handleErrorMsg } from '@/utils/handleErrorMsg'
import { post } from '@/utils/request';
import { RegisterRequest } from '@/interface/user/register';
import { LoginResponse, WrapLoginRequest } from '@/interface/user/login';
import Cookies from 'js-cookie';
import { Action } from '@/redux/actions';
import './index.less';

export type MenuItem = 'login' | 'register' | 'forgetPw';
interface Props extends FormComponentProps {
  dispatch(action: Action): void;
  hide(): void;
  visible: boolean;
  menu: MenuItem | null;
}
interface Register {
  username: string;
  password: string;
  passwordAgain: string;
  email: string;
  verifyCode: string;
}

export const prefix = (str?: string): string => str ? `sign-up-${str}` : 'sign-up';

function SignUp(props: Props) {
  const { visible, hide, form, menu, dispatch } = props;
  const [loading, setLoading] = useState(false); // 控制登录按钮的loading
  const [selectMenu, setSelectMenu] = useState<MenuItem | null>(menu);
  const [emailLogin, setEmailLogin] = useState(false); // 登录方式, 默认是用户名登录
  const { validateFields, resetFields } = form;

  const handleLogin = (values: WrapLoginRequest) => {
    const reqData = emailLogin ? {
      ...values,
      // @ts-ignore
      verifyCode: md5(md5(values.email + md5(values.verifyCode.toLowerCase()))),
    } : {
      ...values,
      // @ts-ignore
      password: md5(md5(values.username + md5(values.password))),
    };
    setLoading(true);
    const LOGINURL = emailLogin ? EMAILLOGIN_URL : USERNAMELOGIN_URL;
    post(LOGINURL, reqData).then((res: LoginResponse) => {
      message.success('登录成功');
      setLoading(false);
      hide();
      res.data.token && Cookies.set('token', res.data.token, { expires: 1, path: '/' });
      dispatch({
        type: 'GET_USERINFO',
        payload: {
          ...res.data.userInfo,
          uid: res.data.userInfo && res.data.userInfo.uid.slice(0, 8),
        },
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: true,
      });
    }).catch(e => {
      setLoading(false);
      handleErrorMsg(e);
    })
  };

  const changeMenu = (value: MenuItem, clear = true) => {
    if (clear) {
      resetFields();
      setSelectMenu(value);
    } else {
      setSelectMenu(value);
    }
  };

  const handleRegister = (values: Register) => {
    const nowDate = new Date();
    const reqData: RegisterRequest = {
      username: values.username,
      password: md5(md5(values.username + md5(values.passwordAgain))), // 采用md5(md5(username + md5(password)))形式加密
      email: values.email,
      verifyCode: md5(md5(values.email + md5(values.verifyCode.toLowerCase()))),
      createTime: dayjs(nowDate).format('YYYY-MM-DD'),
    };
    setLoading(true);
    post(REGISTER_URL, reqData).then(() => {
      message.success('注册成功');
      setTimeout(() => changeMenu('login', false), 0); // 跳转到登录界面, 切不要清空表单
    }).catch(e => {
      handleErrorMsg(e);
    }).finally(() => {
      setLoading(false);
    })
  };

  const handleOk = (e: any) => {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: WrapLoginRequest | Register) => {
      if(!errors && values) {
        if (selectMenu === 'login') {
          // @ts-ignore
          handleLogin(values);
        } else if (selectMenu === 'register') {
          // @ts-ignore
          handleRegister(values);
        }
      }
    })
  }

  // 忘记密码配置
  const handleClickForgetPw = () => {
    changeMenu('forgetPw');
  }

  // 马上登录配置
  const handleClickLogin = () => {
    changeMenu('login');
  }

  // 切换登录方式
  const handleChangeLogin = () => setEmailLogin(!emailLogin);

  const handleMenuChange = ({ key }: any) => changeMenu(key);

  const checkMenuItem = () => {
    switch(selectMenu) {
      case 'login':
        return (
          <div className={prefix('footer-container')}>
            <div className={prefix('footer-item')} onClick={handleChangeLogin}>{emailLogin ? '用户名密码登录' : '邮箱验证码登录'}</div>
            <div className={prefix('footer-item')} onClick={handleClickForgetPw}>忘记密码？</div>
          </div>
        );
      case 'register':
        return <div className={prefix('footer-item')} onClick={handleClickLogin}>马上登录</div>;
      default:
        return <div />
    }
  };

  const PCFooter: ReactNode = (
    <div className={selectMenu === 'login' ? prefix('footer-login') : prefix('footer')}>
      {checkMenuItem()}
      <div className={prefix('footer-operation')}>
        <Button key="cancel" onClick={hide} className={prefix('footer-operation-btn')}>
          取消
        </Button>
        {
          selectMenu !== 'forgetPw' &&
          <Button
            key="confirm"
            type="primary"
            onClick={handleOk}
            loading={loading}
            className={prefix('footer-operation-btn')}
          >
            {selectMenu === 'login' ? '登录' : '注册'}
          </Button>
        }
      </div>
    </div>
  );

  const MobileFooter: ReactNode = (
    <div className={prefix('footer__mobile')}>
      {
        selectMenu !== 'forgetPw' &&
        <Button
          key="confirm"
          type="primary"
          onClick={handleOk}
          loading={loading}
          className={prefix('footer__mobile-btn')}
        >
          {selectMenu === 'login' ? '登录' : '注册'}
        </Button>
      }
      <Button key="cancel" onClick={hide} className={prefix('footer__mobile-btn')}>
        取消
      </Button>
    </div>
  )

  return (
    <Modal
      visible={visible}
      centered
      closable={false}
      className={prefix()}
      title={
        <div className={prefix('title')}>
          <Menu
            mode="horizontal"
            className={prefix('title-menu')}
            selectedKeys={selectMenu ? [selectMenu] : []}
            onSelect={handleMenuChange}
          >
            <Menu.Item key="login" className={prefix('title-menu-item')}>登录</Menu.Item>
            <Menu.Item key="register" className={prefix('title-menu-item')}>注册</Menu.Item>
            <Menu.Item key="forgetPw" className={prefix('title-menu-item')}>忘记密码</Menu.Item>
          </Menu>
          <Icon className={prefix('title-icon')} component={screen.isLittleScreen ? closeMobile as any : close as any} onClick={hide} />
        </div>
      }
      footer={
        screen.isLittleScreen ? MobileFooter : PCFooter
      }
      onCancel={hide}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose={true}
    >
      <Form className={prefix('form')}>
        {selectMenu === 'login' ? <Login form={form} emailLogin={emailLogin} handleChangeLogin={handleChangeLogin}/> : selectMenu === 'register' ? <Register form={form} /> : <ForgetPw form={form} />}
      </Form>
    </Modal>
  )
}

export const WrapSignUp = Form.create<Props>({
  name: 'sign-up'
})(SignUp);