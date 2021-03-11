import React from 'react';
import { Form, Input } from 'antd';
import { inputProps } from '@/constants/inputProps';
import { prefix } from './index';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
  username: string;
}

export function Login(props: Props) {
  const { form, username } = props;
  const { getFieldDecorator } = form;

  return (
    <>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>账号：</div>
        { getFieldDecorator('username', {
          initialValue: username,
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
            className={prefix('form-item-input')}
            placeholder="账号"
            autoFocus
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item>
        <div className={prefix('form-item-text')}>密码：</div>
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
            className={prefix('form-item-input')}
            placeholder="密码"
            { ...inputProps }
          />
        )}
      </Form.Item>
    </>
  )
}
