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
import './index.less';

export type MenuItem = 'login' | 'register' | 'forgetPw';
interface Props extends FormComponentProps {
  hide(): void;
  visible: boolean;
  menu: MenuItem | null;
}

interface Login {
  username: string;
  password: string;
}

interface Register {
  username: string;
  password: string;
  passwordAgain: string;
  nickname: string;
}

interface ForgetPw {
  username: string;
  newPassword: string;
  newPasswordAgain: string;
}

export const prefix = (str?: string): string => str ? `sign-up-${str}` : 'sign-up';

function SignUp(props: Props) {
  const { visible, hide, form, menu } = props;
  const [loading, setLoading] = useState(false); // 控制登录按钮的loading
  const [selectMenu, setSelectMenu] = useState<MenuItem | null>(menu);
  const { validateFields } = form;

  const handleLogin = (values: Login) => {
    console.log('来到了这里', md5(md5(values.username + md5(values.password)))); // 采用md5(md5(username + md5(password)))形式加密
    hide();
  }

  const handleRegister = (values: Register) => {
    // 发送注册的请求
    console.log(values);
    hide();
  }

  const handleForgetPw = (values: ForgetPw) => {
    // 发送重置密码的请求
    console.log(values);
    hide();
  }

  const handleOk = (e: any) => {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: Login | Register | ForgetPw) => {
      if(!errors && values) {
        switch(selectMenu) {
          case 'login':
            // @ts-ignore
            handleLogin(values);
            break;
          case 'register':
            // @ts-ignore
            handleRegister(values);
            break;
          case 'forgetPw':
            // @ts-ignore
            handleForgetPw(values);
        }
      }
    })
  }

  // 忘记密码配置
  const handleClickForgetPw = () => {
    setSelectMenu('forgetPw');
  }

  // 马上登录配置
  const handleClickLogin = () => {
    setSelectMenu('login');
  }

  const handleMenuChange = ({ key }: any) => setSelectMenu(key);

  const checkMenuItem = () => {
    switch(selectMenu) {
      case 'login':
        return <div className={prefix('footer-item')} onClick={handleClickForgetPw}>忘记密码？</div>;
      case 'register':
        return <div className={prefix('footer-item')} onClick={handleClickLogin}>马上登录</div>;
      default:
        return <div/>
    }
  };

  const PCFooter: ReactNode = (
    <div className={prefix('footer')}>
      {checkMenuItem()}
      <div className={prefix('footer-operation')}>
        <Button key="cancel" onClick={hide} className={prefix('footer-operation-btn')}>
          取消
        </Button>
        <Button
          key="confirm"
          type="primary"
          onClick={handleOk}
          loading={loading}
          className={prefix('footer-operation-btn')}
        >
          {selectMenu === 'login' ? '登录' : selectMenu === 'register' ? '注册' : '确定修改'}
        </Button>
      </div>
    </div>
  );

  const MobileFooter: ReactNode = (
    <div className={prefix('footer__mobile')}>
      <Button
        key="confirm"
        type="primary"
        onClick={handleOk}
        loading={loading}
        className={prefix('footer__mobile-btn')}
      >
        {selectMenu === 'login' ? '登录' : selectMenu === 'register' ? '注册' : '确定修改'}
      </Button>
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
        {selectMenu === 'login' ? <Login form={form} /> : selectMenu === 'register' ? <Register form={form} /> : <ForgetPw form={form} />}
      </Form>
    </Modal>
  )
}

export const WrapSignUp = Form.create<Props>({
  name: 'sign-up'
})(SignUp);