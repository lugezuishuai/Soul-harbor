import React from 'react';
import { Form, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { inputProps } from '@/constants/inputProps';
import { prefix } from './index';
import { screen } from '@/constants/screen';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
}

export function ForgetPw(props: Props) {
  const { form } = props;
  const { getFieldDecorator, getFieldValue } = form;

  return (
    <>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>账号：</div>
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
            className={prefix('form-item-input')}
            placeholder="账号"
            autoFocus={screen.isBigScreen}
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>新的密码：</div>
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
              className={prefix('form-item-input')}
              placeholder="新的密码"
              { ...inputProps }
            />
          )}
      </Form.Item>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>确认密码：</div>
        { getFieldDecorator('newPasswordAgain', {
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
            className={prefix('form-item-input')}
            placeholder="确认密码"
            { ...inputProps }
          />
        )}
      </Form.Item>
    </>
  )
}
