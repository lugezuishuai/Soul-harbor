import React, { useState, useEffect } from 'react';
import { Form, Input, message, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { inputProps } from '@/constants/inputProps';
import { prefix } from './index';
import { SENDREGISTERVC_URL } from '@/constants/urls';
import { post } from '@/utils/request';
import { handleErrorMsg } from '@/utils/handleErrorMsg';
import { screen } from '@/constants/screen';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
}

export function Register(props: Props) {
  const { form } = props;
  const { getFieldDecorator, getFieldValue, validateFields } = form;
  const [loading, setLoading] = useState(false); // 控制「发送验证码」按钮的loading
  const [disabled, setDisabled] = useState(false); // 控制『发送验证码』按钮的disabled
  const [timer, setTimer] = useState<any>(null); // 计时器
  const [count, setCount] = useState(60); // 秒数

  const renderBtnText = () => disabled && timer ? `${count}秒后重新获取` : '获取验证码';

  const handleClickBtn = () => {
    validateFields(['email'], (errors: Record<string, any>, values: string) => {
      if (!errors && values) {
        setLoading(true);
        setDisabled(disabled => !disabled);
        post(SENDREGISTERVC_URL, { email: getFieldValue('email') }).requestObj
        .then(() => {
          message.success('发送验证码成功');
          setTimer(setInterval(() => {
            setCount(count => count - 1);
          }, 1000));
        })
        .catch(e => {
          handleErrorMsg(e);
          setDisabled(disabled => !disabled);
        })
        .finally(() => {
          setLoading(false);
        });
      }
    });
  };

  const renderFormItemHeader = () => {
    return (
      <div className={prefix('form-item-header')}>
        <div className={prefix('form-item-header-text')}>验证码</div>
        <Button
          className={prefix('form-item-header-btn')}
          type="primary"
          disabled={disabled}
          loading={loading}
          onClick={handleClickBtn}
        >
          {renderBtnText()}
        </Button>
      </div>
    )
  };

  useEffect(() => {
    if (count === 0 && timer) {
      clearInterval(timer); // 关掉定时器
      setTimer(null);
      setDisabled(disabled => !disabled);
      setCount(60);
    }
  }, [count, timer]);

  return (
    <>
       <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>用户名：</div>
        {getFieldDecorator('username', {
          rules: [
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
            autoFocus={screen.isBigScreen}
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>密码：</div>
        {getFieldDecorator('password', {
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
        {getFieldDecorator('passwordAgain', {
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
        {getFieldDecorator('email', {
          rules: [
            {validator(rule, value, callback) {
              const reg = /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
              if(!value || value.length === 0) {
                callback('请输入邮箱');
              } else if(!reg.test(value)) {
                callback('请输入正确的邮箱地址')
              } else {
                callback();
              }
            }}
          ]
        })(
          <Input
            className={prefix('form-item-input')}
            placeholder="邮箱"
            { ...inputProps }
          />
        )}
      </Form.Item>
      <Form.Item>
        {screen.isLittleScreen ?
          <>
            {renderFormItemHeader()}
            {getFieldDecorator('verifyCode', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '请输入验证码'
                },
                {
                  max: 6,
                  message: '请输入正确的验证码'
                }
              ]
            })(
              <Input
                className={prefix('form-item-input')}
                placeholder="验证码"
                { ...inputProps }
              />
            )}
          </>
          :
          <>
            <div className={prefix('form-item-text')}>验证码：</div>
            <div className={prefix('form-item-verify')}>
              {getFieldDecorator('verifyCode', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入验证码'
                  },
                  {
                    max: 6,
                    message: '请输入正确的验证码'
                  }
                ]
              })(
                <Input
                  className={prefix('form-item-input-verify')}
                  placeholder="验证码"
                  { ...inputProps }
                />
              )}
              <Button 
                className={prefix('form-item-send')}
                type="primary"
                disabled={disabled}
                loading={loading}
                onClick={handleClickBtn}
              >
                {renderBtnText()}
              </Button>
            </div>
          </>
        }
      </Form.Item>
    </>
  )
}
