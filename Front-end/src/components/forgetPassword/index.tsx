import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { inputProps } from '@/constants/inputProps';
import style from './index.less';

interface Props extends FormComponentProps {
  visible: boolean;
  hide(): void;
  showSignUpModal(): void;
  username: string;
}

export interface RewritePw {
  username: string;
  newPassword: string;
  newPassword_again: string;
}

function ForgetPassword(props: Props) {
  const { visible, hide, form, username, showSignUpModal } = props;
  const { getFieldDecorator, getFieldValue, validateFields } = form;
  const [loading, setLoading] = useState(false);            // 控制确认按钮的loading
  
  const handleCancel = () => {
    setLoading(false);
    hide();
  }

  const handleOk = (e: any) => {
    // 发送请求
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: RewritePw) => {
      if(!errors) {
        const { username, newPassword_again } = values;
        const formData = {
          username, 
          newPassword_again
        };
        // 发送请求, 注册成功关闭弹窗
        message.success('修改成功');
        setLoading(false);
        hide();
      }
    })
  }

  return (
    <Modal
      visible={visible}
      centered
      title="忘记密码"
      footer={
        <div className={style.forget_password_footer}>
          <div className={style.forget_password_button}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleOk}>{loading? '修改中' : '确认修改'}</Button>
          </div>
        </div>
      }
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose={true}
    >
      <Form className={style.forget_password_form}>
        <Form.Item>
          <label htmlFor="username">账号：</label>
          { getFieldDecorator('username', {
            initialValue: username,           // 默认填充用户登录时填写的账号
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
              id="username"
              placeholder="账号"
              autoFocus
              { ...inputProps }
            />
          )}
        </Form.Item>
        <Form.Item>
            <label htmlFor="newPassword">新的密码：</label>
            { getFieldDecorator('newPassword', {
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
                id="newPassword"
                placeholder="新的密码"
                { ...inputProps }
                style={{ width: 372 }}
              />
            )}
          </Form.Item>
          <Form.Item>
            <label htmlFor="newPassword_again">确认密码：</label>
            { getFieldDecorator('newPassword_again', {
              rules: [
                { validator(rule, value, callback) {
                  if(value !== getFieldValue('newPassword')) {
                    callback('密码不相符');
                  } else {
                    callback();
                  }
                }}
              ]
            })(
              <Input.Password
                id="newPassword_again"
                placeholder="确认密码"
                { ...inputProps }
                style={{ width: 372 }}
              />
            )}
          </Form.Item>
      </Form>
    </Modal>
  )
}

const WrapForgetPassword = Form.create<Props>({
  name: 'sign_up'
})(ForgetPassword);

export default WrapForgetPassword;