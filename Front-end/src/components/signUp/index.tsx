import React, { useState } from 'react';
import { Form, Input, Modal, Button, message, Icon } from 'antd';
import close from '@/assets/icon/close.svg';
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

function SignUp(props: Props) {
  const { visible, hide, form, showForgetPwModal } = props;
  const [loading, setLoading] = useState(false);                                  // 控制登录按钮的loading
  const { getFieldDecorator, getFieldValue, validateFields } = form;
  const handleOk = (e: any) => {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: Account) => {
      if(!errors) {
        // 发送请求
        message.success('登录成功');
        setLoading(false);
        hide();
      }
    })
  }
  const handleCancel = () => {
    setLoading(false);
    hide();
  }

  // 忘记密码配置
  const handleClickForgetPw = () => {
    setLoading(false);
    hide();
    showForgetPwModal(getFieldValue('username'));       // 点击唤起‘忘记密码’弹窗
  }

  return (
    <Modal
      visible={visible}
      centered
      closable={false}
      className="sign-up"
      title={
        <div className="sign-up-title">
          <div className="sign-up-title__text">欢迎登录</div>
          <Icon
            className="sign-up-title__icon"
            component={close as any}
            onClick={handleCancel}
          />
        </div>
      }
      footer={
        <div className="sign-up-footer">
          <div className="sign-up-footer-forget" onClick={handleClickForgetPw}>忘记密码？</div>
          <div className="sign-up-footer-operation">
            <Button key="cancel" onClick={handleCancel} className="sign-up-footer-operation-cancel">
              取消
            </Button>
            <Button
              key="ok"
              type="primary"
              onClick={handleOk}
              loading={loading}
              className="sign-up-footer-operation-login"
            >
              登录
            </Button>
          </div>
        </div>
      }
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose={true}         // 关闭时销毁 Modal 里的子元素
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