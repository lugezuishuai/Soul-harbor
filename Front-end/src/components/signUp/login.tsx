import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { inputProps } from '@/constants/inputProps';
import { prefix } from './index';
import { WrappedFormUtils } from 'antd/lib/form/Form';
// import { SendVCResponse } from '@/interface/user/sendVerifyCode';
import { SENDVERIFYCODE_URL } from '@/constants/urls';
import { post } from '@/utils/request';
import { handleErrorMsg } from '@/utils/handleErrorMsg';
import { screen } from '@/constants/screen';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
  emailLogin: boolean; // 登录方式
  handleChangeLogin(): void;
}

export function Login(props: Props) {
  const { form, emailLogin, handleChangeLogin } = props;
  const { getFieldDecorator, getFieldValue, validateFields } = form;
  const [loading, setLoading] = useState(false); // 控制「发送验证码」按钮的loading
  const [disabled, setDisabled] = useState(false); // 控制『发送验证码』按钮的disabled
  const [timer, setTimer] = useState<any>(null); // 计时器
  const [count, setCount] = useState(60); // 秒数

  const renderBtnText = () => disabled && timer ? `${count}s` : '获取验证码';

  const handleClickBtn = () => {
    validateFields(['email'], (errors: Record<string, any>, values: string) => {
      if (!errors && values) {
        setLoading(true);
        setDisabled(!disabled);
        post(SENDVERIFYCODE_URL, { email: getFieldValue('email') })
        .then(() => {
          message.success('发送验证码成功');
          setTimer(setInterval(() => {
            setCount(count => count - 1);
          }, 1000));
        })
        .catch(e => {
          handleErrorMsg(e);
          setDisabled(!disabled);
        })
        .finally(() => {
          setLoading(false);
        });
      }
    });
  };

  const renderBottom = () => (
    <div className={prefix('content-bottom')}>
      <div className={prefix('content-bottom-text')} onClick={handleChangeLogin}>
        {emailLogin ? '用户名密码登录' : '邮箱验证码登录'}
      </div>
      {emailLogin &&
        <Button
          className={prefix('content-bottom-btn')}
          type="primary"
          disabled={disabled}
          loading={loading}
          onClick={handleClickBtn}
        >
          {renderBtnText()}
        </Button>
      }
    </div>
  )

  useEffect(() => {
    if (count === 0 && timer) {
      clearInterval(timer); // 关掉定时器
      setTimer(null);
      setDisabled(!disabled);
      setCount(60);
    }
  }, [count, timer]);

  return emailLogin ? 
  <>
    <Form.Item className={prefix('form-item')}>
      <div className={prefix('form-item-text')}>邮箱：</div>
      { getFieldDecorator('email', {
        rules: [
          { validator(rule, value, callback) {
            if(!value || value.length === 0) {
              callback('请输入邮箱');
            } else if(/\s+/g.test(value)) {
              callback('邮箱中不能有空格')
            } else {
              callback();
            }
          }}
        ]
      })(
        <Input
          className={prefix('form-item-input')}
          placeholder="邮箱"
          autoFocus
          { ...inputProps }
        />
      )}
    </Form.Item>
    <Form.Item>
      <div className={prefix('form-item-text')}>验证码：</div>
      {screen.isLittleScreen ? 
        getFieldDecorator('verifyCode', {
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
        )
        :
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
      }
    </Form.Item>
    {screen.isLittleScreen && renderBottom()}
  </> :
  <>
    <Form.Item className={prefix('form-item')}>
      <div className={prefix('form-item-text')}>用户名：</div>
      { getFieldDecorator('username', {
        rules: [
          { validator(rule, value, callback) {
            if(!value || value.length === 0) {
              callback('请输入用户名');
            } else if(/\s+/g.test(value)) {
              callback('用户名中不能有空格')
            } else {
              callback();
            }
          }}
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
    {screen.isLittleScreen && renderBottom()}
  </>
}
