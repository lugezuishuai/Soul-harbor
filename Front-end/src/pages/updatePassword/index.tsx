import React, { useState, useEffect } from 'react';
import { Form, Input, Icon, Spin, Button, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import update from '@/assets/icon/update.svg';
import updateMobile from '@/assets/icon/update_mobile.svg';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { screen } from '@/constants/screen';
import { CHECKTOKENVALID, UPDATEPASSWORD } from '@/constants/urls';
import { CheckTokenValidResponse, CheckTokenValidRequest } from '@/interface/user/checkTokenValid';
import { UpdatePasswordReq } from '@/interface/user/updatePassword';
import invalidLink from '@/assets/image/invalid_link.png';
import backHome from '@/assets/icon/back_home.svg';
import backHomeMobile from '@/assets/icon/back_home_mobile.svg';
import md5 from 'md5';
import { apiGet, apiPost } from '@/utils/request';
import './index.less';

interface Props {
  form: WrappedFormUtils<any>;
  [key: string]: any;
}

interface FormData {
  newPassword: string;
  newPasswordAgain: string;
}

const inputProps = {
  autoComplete: 'on',
  allowClear: true,
};

function ForgetPw(props: Props) {
  const { form, history } = props;
  const { getFieldDecorator, getFieldValue, validateFields } = form;
  const [username, setUsername] = useState<string | null>(null);
  const [isLinkValid, setIsLinkValid] = useState(true); // 链接是否有效
  const [btnLoading, setBtnLoading] = useState(false); // 「确认修改」按钮loading
  const [loading, setLoading] = useState(true);

  const prefix = (str?: string): string => (str ? `update-password-${str}` : 'update-password');

  const handleResetPassword = (e: any) => {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: FormData) => {
      if (!errors && values) {
        const reqData: UpdatePasswordReq = {
          username: username || '',
          password: md5(md5(username + md5(values.newPasswordAgain))),
        };
        setBtnLoading(true);
        apiPost(UPDATEPASSWORD, reqData)
          .then(() => {
            // 跳转回首页
            message.success('修改成功');
            history.push({ pathname: '/' });
          })
          .catch((e) => console.error(e))
          .finally(() => setBtnLoading(false));
      }
    });
  };

  useEffect(() => {
    const pathArr = window.location.href.split('/');
    const token = pathArr[pathArr.length - 1];
    const reqData: CheckTokenValidRequest = {
      resetPasswordToken: token,
    };
    apiGet(CHECKTOKENVALID, reqData)
      .then((res: CheckTokenValidResponse) => {
        res.data.username && setUsername(res.data.username);
      })
      .catch(() => {
        setIsLinkValid(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderContent = () => {
    if (username && isLinkValid) {
      return (
        <div className={prefix('container')}>
          <div className={prefix('header')}>
            <Icon
              className={prefix('header-icon')}
              component={screen.isLittleScreen ? (updateMobile as any) : (update as any)}
            />
            <div className={prefix('header-text')}>更改密码</div>
          </div>
          <Form className={prefix('form')}>
            <Form.Item className={prefix('form-item')}>
              <div className={prefix('form-item-text')}>新的密码：</div>
              {getFieldDecorator('newPassword', {
                rules: [
                  {
                    validator(rule, value, callback) {
                      const regExp = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]{6,}.*$/;
                      if (!value || value === 0) {
                        callback('请输入密码');
                      } else if (value.length < 6) {
                        callback('密码不能少于6个字符');
                      } else if (!regExp.test(value)) {
                        callback('密码必须包含数字、大小写字母和特殊符号');
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(<Input.Password className={prefix('form-item-input')} placeholder="新的密码" {...inputProps} />)}
            </Form.Item>
            <Form.Item className={prefix('form-item')}>
              <div className={prefix('form-item-text')}>确认密码：</div>
              {getFieldDecorator('newPasswordAgain', {
                rules: [
                  {
                    validator(rule, value, callback) {
                      if (value !== getFieldValue('newPassword')) {
                        callback('密码不相符');
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(<Input.Password className={prefix('form-item-input')} placeholder="确认密码" {...inputProps} />)}
            </Form.Item>
          </Form>
          <div className={prefix('footer')}>
            <Button className={prefix('footer-btn')} type="primary" loading={btnLoading} onClick={handleResetPassword}>
              确认修改
            </Button>
            <Link className={prefix('footer-back')} to="/">
              返回首页
            </Link>
          </div>
        </div>
      );
    } else {
      return (
        <div className={prefix('invalid')}>
          <img src={invalidLink} className={prefix('invalid-img')} alt="invalid-link" />
          <div className={prefix('invalid-back')}>
            <Icon
              component={screen.isLittleScreen ? (backHomeMobile as any) : (backHome as any)}
              className={prefix('invalid-back-icon')}
            />
            <div className={prefix('invalid-back-text')}>该链接已失效或者过期，您可以选择：</div>
          </div>
          <Link className={prefix('invalid-btn')} to="/">
            返回首页
          </Link>
        </div>
      );
    }
  };

  return <div className={prefix()}>{loading ? <Spin className={prefix('spin')} /> : renderContent()}</div>;
}

const WrapForgetPw = Form.create<Props>({
  name: 'forget-password',
})(ForgetPw);

export default withRouter(WrapForgetPw as any);
