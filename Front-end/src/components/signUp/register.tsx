import React from 'react';
import { Form, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { inputProps } from '@/constants/inputProps';
import { prefix } from './index';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
}

export function Register(props: Props) {
  const { form } = props;
  const { getFieldDecorator, getFieldValue } = form;

  return (
    <>
       <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>用户名：</div>
        { getFieldDecorator('username', {
          rules: [
            // { validator(rule, value, callback) {
            //   if(!value || value.length === 0) {
            //     callback('请输入用户名');
            //   } else if(/\s+/g.test(value)) {
            //     callback('用户名中不能有空格');
            //   } else if(value.length < 6) {
            //     callback('用户名不能少于6个字符');
            //   } else {
            //     callback();
            //   }
            // }}
            {
              required: true,
              whitespace: true,
              message: '请输入用户名',
            },
            {
              max: 10,
              message: '不能多于十个字符',
            },
          ]
        })(
          <Input
            className={prefix('form-item-input')}
            placeholder="用户名"
            autoFocus
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>密码：</div>
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
            className={prefix('form-item-input')}
            placeholder="密码"
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>确认密码：</div>
        { getFieldDecorator('passwordAgain', {
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
            className={prefix('form-item-input')}
            placeholder="确认密码"
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>邮箱：</div>
        { getFieldDecorator('email', {
          rules: [
            {
              required: true,
              whitespace: true,
              message: '请输入邮箱'
            },
            {
              max: 20,
              message: '不能多于20个字符'
            }
          ]
        })(
          <Input
            className={prefix('form-item-input')}
            placeholder="邮箱"
            { ...inputProps }
          />
        )}
      </Form.Item>
    </>
  )
}
