import React from 'react';
import { Form, Tooltip, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Show from '@/assets/icon/show.svg';
import Hide from '@/assets/icon/hide.svg';
import { debounce } from 'lodash';
import copy from 'copy-to-clipboard';
import '../index.less';
import './index.less';

interface Props extends FormComponentProps {
  userName: string;
  userId: string;
  showUserName: boolean;
  showUserId: boolean;
  handleShowUserName(): void;
  handleShowUserId(): void;
}

function AccountInfo(props: Props) {
  const { userName, userId, showUserName, showUserId, handleShowUserId, handleShowUserName } = props;
  const userNameLen = userName.length; // 用户名的长度
  const userIdLen = userId.length; // 用户ID的长度

  const onCopy = debounce((accountInfo: string) => {
    copy(accountInfo);
    message.destroy();
    message.success({
      content: '复制成功',
      key: 'copy-account-info',
      duration: 1,
    });
  }, 200);

  return (
    <div className="account-info">
      <div className="account-info__title">账号信息</div>
      <Form className="account-info__form">
        <Form.Item className="account-info__form__item">
          <div className="account-info__label">账号</div>
          <div className="account-info__show">
            <Tooltip title="复制" placement="bottom">
              <div className="account-info__text" onClick={() => userName && onCopy(userName)}>
                {showUserName ? userName : new Array(userNameLen).fill('*')}
              </div>
            </Tooltip>
            {showUserName ? (
              <Tooltip title="隐藏">
                <Icon component={Hide as any} onClick={handleShowUserName} className="account-info__icon" />
              </Tooltip>
            ) : (
              <Tooltip title="显示">
                <Icon component={Show as any} onClick={handleShowUserName} className="account-info__icon" />
              </Tooltip>
            )}
          </div>
        </Form.Item>
        <Form.Item className="account-info__form__item">
          <div className="account-info__label">用户ID</div>
          <div className="account-info__show">
            <Tooltip title="复制" placement="bottom">
              <span className="account-info__text" onClick={() => userId && onCopy(userId)}>
                {showUserId ? userId : new Array(userIdLen).fill('*')}
              </span>
            </Tooltip>
            {showUserId ? (
              <Tooltip title="隐藏">
                <Icon component={Hide as any} onClick={handleShowUserId} className="account-info__icon" />
              </Tooltip>
            ) : (
              <Tooltip title="显示">
                <Icon component={Show as any} onClick={handleShowUserId} className="account-info__icon" />
              </Tooltip>
            )}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

const WrapAccountInfo = Form.create<Props>({
  name: 'account-info',
})(AccountInfo);

export default WrapAccountInfo;
