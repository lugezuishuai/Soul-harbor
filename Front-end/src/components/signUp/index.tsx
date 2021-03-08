import React, { useState } from 'react';
import { Form, Input, Modal, Button, message, Icon, Menu } from 'antd';
import close from '@/assets/icon/close.svg';
import closeMobile from '@/assets/icon/close_mobile.svg';
import { screen } from '@/constants/screen';
import { FormComponentProps } from 'antd/lib/form';
import { inputProps } from '@/constants/inputProps';
import './index.less';

interface Props extends FormComponentProps {
  showForgetPwModal(username: string): void;
  hide(): void;
  visible: boolean;
}

export interface Account {
  username: string;
  password: string;
}

type MenuItem = 'login' | 'register' | 'forgetPw';

function SignUp(props: Props) {
  const { visible, hide, form, showForgetPwModal } = props;
  const prefix = (str?: string) => str ? `sign-up-${str}` : 'sign-up';
  const [loading, setLoading] = useState(false); // 控制登录按钮的loading
  const [disabled, setDisabled] = useState(true); // 控制按钮的disable
  const [selectMenu, setSelectMenu] = useState<MenuItem>('login');
  const [formData, setFormData] = useState({}); // 这里还需要定义类型
  const { getFieldDecorator, getFieldValue, validateFields } = form;

  const handleLogin = () => {
    // 发送登录的请求
    hide();
  }

  const handleRegister = () => {
    // 发送注册的请求
    hide();
  }

  const handleForgetPw = () => {
    // 发送重置密码的请求
    hide();
  }

  const handleOk = (e: any) => {
    e.preventDefault();
    // validateFields((errors: Record<string, any>, values: Account) => {
    //   if(!errors) {
    //     // 发送请求
    //     message.success('登录成功');
    //     setLoading(false);
    //     hide();
    //   }
    // })
    if (selectMenu === 'login') {
      handleLogin();
    } else if (selectMenu === 'register') {
      handleRegister();
    } else {
      handleForgetPw();
    }
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

  // 传递给子组件的函数
  const checkDisable = (value: boolean) => setDisabled(value);

  const setRequestData = (data: any) => setFormData(data);

  const checkMenuItem = () => {
    switch(selectMenu) {
      case 'login':
        return <div className={prefix('footer-item')} onClick={handleClickForgetPw}>忘记密码？</div>;
      case 'register':
        return <div className={prefix('footer-item')} onClick={handleClickLogin}>马上登录</div>;
      default:
        return <div/>
    }
  }

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
            selectedKeys={[selectMenu]}
            onSelect={handleMenuChange}
          >
            <Menu.Item key="login" className={prefix('title-menu-item')}>登录</Menu.Item>
            <Menu.Item key="register" className={prefix('title-menu-item')}>注册</Menu.Item>
            <Menu.Item key="forgetPw" className={prefix('title-menu-item')}>忘记密码</Menu.Item>
          </Menu>
          <Icon className={prefix('title-icon')} component={screen.isLittleScreen ? closeMobile as any : close as any} />
        </div>
      }
      footer={
        <div className={prefix('footer')}>
          {checkMenuItem()}
          <div className={prefix('footer-operation')}>
            <Button key="cancel" onClick={hide} className={prefix('footer-operation-btn')}>
              取消
            </Button>
            <Button
              key="ok"
              type="primary"
              onClick={handleOk}
              loading={loading}
              disabled={disabled}
              className={prefix('footer-operation-btn')}
            >
              {selectMenu === 'login' ? '登录' : selectMenu === 'register' ? '注册' : '确定修改'}
            </Button>
          </div>
        </div>
      }
      onCancel={hide}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose={true}
    >
      <Form className="sign-up-form">
        <Form.Item className="sign-up-form-item">
          <div className="sign-up-form-item-text">账号：</div>
          { getFieldDecorator('username', {
            rules: [
              { validator(rule, value, callback) {
                if(!value || value.length === 0) {
                  callback('请输入账号');
                } else if(/\s+/g.test(value)) {
                  callback('账号中不能有空格')
                } else {
                  callback();
                }
              }}
            ]
          })(
            <Input
              className="sign-up-form-item-input"
              id="username"
              placeholder="账号"
              autoFocus
              { ...inputProps }
            />
          )}
        </Form.Item>
        <Form.Item>
          <div className="sign-up-form-item-text">密码：</div>
          { getFieldDecorator('password', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: '请输入密码'
              }
            ]
          })(
            <Input.Password
              className="sign-up-form-item-input"
              id="password"
              placeholder="密码"
              { ...inputProps }
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

const WrapSignUp = Form.create<Props>({
  name: 'sign-up'
})(SignUp);

export default WrapSignUp;