import React, { useState, useEffect } from 'react';
import { Button, Form, Icon, Input, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { inputProps } from './index';
import { prefix } from './index';
import { screen } from '@/constants/screen';
import { apiPost } from '@/utils/request';
import { SENDFORGETPASSWORD_LINK } from '@/constants/urls';
import warn from '@/assets/icon/warn.svg';
import warnMobile from '@/assets/icon/warn_mobile.svg';
import { ForgetPasswordRequest } from '@/interface/user/forgetPassword';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
}

export function ForgetPw(props: Props) {
  const { form } = props;
  const { getFieldDecorator, getFieldValue, validateFields } = form;
  const [loading, setLoading] = useState(false); // 控制「发送验证码」按钮的loading
  const [disabled, setDisabled] = useState(false); // 控制『发送验证码』按钮的disabled
  const [timer, setTimer] = useState<any>(null); // 计时器
  const [count, setCount] = useState(60); // 秒数

  const renderBtnText = () => (disabled && timer ? `${count}秒后重新发送` : '发送重置密码链接');

  const handleClickBtn = () => {
    validateFields(['email'], (errors: Record<string, any>, values: string) => {
      if (!errors && values) {
        setLoading(true);
        setDisabled((disabled) => !disabled);
        const reqData: ForgetPasswordRequest = {
          email: getFieldValue('email'),
        };
        apiPost(SENDFORGETPASSWORD_LINK, reqData)
          .then(() => {
            message.success('发送验证链接成功');
            setTimer(
              setInterval(() => {
                setCount((count) => count - 1);
              }, 1000)
            );
          })
          .catch(() => {
            setDisabled((disabled) => !disabled);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  useEffect(() => {
    if (count === 0 && timer) {
      clearInterval(timer); // 关掉定时器
      setTimer(null);
      setDisabled((disabled) => !disabled);
      setCount(60);
    }
  }, [count, timer]);

  return (
    <>
      <Form.Item className={prefix('form-item')}>
        <div className={prefix('form-item-text')}>邮箱：</div>
        {getFieldDecorator('email', {
          rules: [
            {
              validator(rule, value, callback) {
                const reg = /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
                if (!value || value.length === 0) {
                  callback('请输入邮箱');
                } else if (!reg.test(value)) {
                  callback('请输入正确的邮箱地址');
                } else {
                  callback();
                }
              },
            },
          ],
        })(
          <Input
            className={prefix('form-item-input')}
            placeholder="邮箱"
            autoFocus={screen.isHugeScreen}
            {...inputProps}
          />
        )}
      </Form.Item>
      <div className={prefix('warn')}>
        <Icon className={prefix('warn-icon')} component={screen.isLittleScreen ? (warnMobile as any) : (warn as any)} />
        <div className={prefix('warn-text')}>收到链接后请在五分钟之内使用</div>
      </div>
      <Button
        className={prefix('sendLink-btn')}
        type="primary"
        disabled={disabled}
        loading={loading}
        onClick={handleClickBtn}
      >
        {renderBtnText()}
      </Button>
    </>
  );
}
