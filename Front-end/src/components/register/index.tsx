import React, { useState } from 'react';
import { Form, Input, Modal, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { inputProps } from '@/constants/inputProps';
import style from './index.less';

interface Props extends FormComponentProps {
  hide(): void;
  showSignUpModal(): void;
  visible: boolean;
}

export interface Info {
  username: string;
  password: string;
  password_again: string;
  nickname: string;
}

function Register(props: Props) {
  const [loading, setLoading] = useState(false);      // 控制登录按钮的loading
  const { visible, hide, showSignUpModal, form } = props;
  const { getFieldDecorator, getFieldValue, validateFields } = form;

  const handleOk = (e: any) => {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: Info) => {
      if(!errors) {
        const { username, password_again, nickname } = values;
        const formData = {        // request的数据
          username,
          password_again,
          nickname
        }
        // 发送请求, 注册成功关闭弹窗
        message.success('注册成功');
        setLoading(false);
        hide();
      }
    })
  }

  const handleCancel = () => {
    setLoading(false);
    hide();
  }

  // 点击'马上登录'关闭注册弹窗弹出注册弹窗
  const handleClick = () => {
    setLoading(false);
    hide();             // 隐藏注册弹窗
    showSignUpModal();  // 显示登录弹窗
  }
  return (
    <>
      <Modal
        visible={visible}
        centered
        title="注册账号"
        footer={
          <div className={style.register_footer}>
            <span className={style.register_go_login} onClick={handleClick}>马上登录</span>
            <div className={style.register_button}>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" onClick={handleOk}>{loading? '注册中' : '注册'}</Button>
            </div>
          </div>
        }
        onCancel={handleCancel}
        onOk={handleOk}
        confirmLoading={loading}
        destroyOnClose={true}           // 关闭时销毁 Modal 里的子元素
      >
        <Form className={style.register_centent}>
          <Form.Item>
            <label htmlFor="username">账号：</label>
            { getFieldDecorator('username', {
              rules: [
                { validator(rule, value, callback) {
                  if(!value || value.length === 0) {
                    callback('请输入账号');
                  } else if(/\s+/g.test(value)) {
                    callback('账号中不能有空格');
                  } else if(value.length < 6) {
                    callback('账号不能少于6个字符');
                  } else {
                    callback();
                  }
                }}
              ]
            })(
              <Input
                id="username"
                placeholder="账号"
                autoFocus
                { ...inputProps }
              />
            )}
          </Form.Item>
          <Form.Item>
            <label htmlFor="password">密码：</label>
            { getFieldDecorator('password', {
              rules: [
                { validator(rule, value, callback) {
                  const regExp = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]{6,}.*$/;
                  if(!value || value === 0) {
                    callback('请输入密码');
                  } else if(value.length < 6) {
                    callback('密码不能少于6个字符');
                  } else if(!regExp.test(value)) {
                    callback('密码必须包含数字、大小写字母和特殊符号');
                  } else {
                    callback();
                  }
                }}
              ]
            })(
              <Input.Password
                id="password"
                placeholder="密码"
                { ...inputProps }
              />
            )}
          </Form.Item>
          <Form.Item>
            <label htmlFor="password_again">确认密码：</label>
            { getFieldDecorator('password_again', {
              rules: [
                { validator(rule, value, callback) {
                  if(value !== getFieldValue('password')) {
                    callback('密码不相符');
                  } else {
                    callback();
                  }
                }}
              ]
            })(
              <Input.Password
                id="password_again"
                placeholder="确认密码"
                { ...inputProps }
                style={{ width: 372 }}
              />
            )}
          </Form.Item>
          <Form.Item>
            <label htmlFor="nickname">昵称：</label>
            { getFieldDecorator('nickname', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '请输入昵称'
                }
              ]
            })(
              <Input
                id="nickname"
                placeholder="昵称"
                { ...inputProps }
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const WrapRegister = Form.create<Props>({
  name: 'register'
})(Register);

export default WrapRegister;