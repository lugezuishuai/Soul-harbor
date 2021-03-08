import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { inputProps } from '@/constants/inputProps';
import { FormComponentProps } from 'antd/lib/form';
import './index.less';

interface Props extends FormComponentProps {
  checkDisable(value: boolean): void;
  setRequestData(data: any): void;
}

function Login(props: Props) {
  const { form, checkDisable, setRequestData } = props;
  const { getFieldDecorator, validateFields, getFieldsError, getFieldsValue } = form;
  const prefix = (str?: string) => str ? `sign-up-login-${str}` : 'sign-up-login';

  return (
    <Form className={prefix()}>
      <Form.Item className={prefix('item')}>
        <div className={prefix('item-text')}>账号：</div>
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
            className={prefix('item-input')}
            placeholder="账号"
            autoFocus
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item>
        <div className={prefix('item-text')}>密码：</div>
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
            className={prefix('item-input')}
            placeholder="密码"
            { ...inputProps }
          />
        )}
      </Form.Item>
    </Form>
  )
}

export const WrapLogin = Form.create<Props>({
  name: 'login'
})(Login);

