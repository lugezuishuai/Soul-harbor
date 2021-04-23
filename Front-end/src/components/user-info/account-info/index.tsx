import React, { ReactNode } from 'react';
import { Form, Tooltip, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Show from '@/assets/icon/show.svg';
import Hide from '@/assets/icon/hide.svg';
import { debounce } from 'lodash';
import copy from 'copy-to-clipboard';
import { screen } from '@/constants/screen';
import { TooltipPlacement } from 'antd/lib/tooltip';
import './index.less';

interface AccountInfoProps extends FormComponentProps {
  userName: string;
  userId: string;
  email: string;
  showUserName: boolean;
  showUserId: boolean;
  showEmail: boolean;
  handleShowUserName(): void;
  handleShowUserId(): void;
  handleShowEmail(): void;
}

function AccountInfo(props: AccountInfoProps) {
  const {
    userName,
    userId,
    email,
    showUserName,
    showUserId,
    showEmail,
    handleShowUserId,
    handleShowUserName,
    handleShowEmail,
  } = props;
  const userNameLen = userName.length; // 用户名的长度
  const userIdLen = userId.length; // 用户ID的长度
  const emailLen = email.length; // 邮箱的长度

  const onCopy = debounce((accountInfo: string) => {
    copy(accountInfo);
    message.destroy();
    message.success({
      content: '复制成功',
      key: 'copy-account-info',
      duration: 1,
    });
  }, 200);

  function renderCopyItem(child: ReactNode, title: string | ReactNode, placement: TooltipPlacement = 'top') {
    return screen.isLittleScreen ? (
      child
    ) : (
      <Tooltip title={title} placement={placement}>
        {child}
      </Tooltip>
    );
  }

  function renderShowOrHideIcon(type: 'show' | 'hide', textType: 'username' | 'userId' | 'email') {
    return (
      <Icon
        component={type === 'hide' ? (Hide as any) : (Show as any)}
        onClick={
          textType === 'username' ? handleShowUserName : textType === 'userId' ? handleShowUserId : handleShowEmail
        }
        className="account-info__icon"
      />
    );
  }

  return (
    <div className="account-info">
      <div className="account-info__title">账号信息</div>
      <Form className="account-info__form">
        <Form.Item className="account-info__form__item">
          <div className="account-info__label">用户名</div>
          <div className="account-info__show">
            {renderCopyItem(
              <div className="account-info__text" onClick={() => userName && onCopy(userName)}>
                {showUserName ? userName : new Array(userNameLen).fill('*')}
              </div>,
              '复制'
            )}
            {showUserName
              ? renderCopyItem(renderShowOrHideIcon('hide', 'username'), '隐藏')
              : renderCopyItem(renderShowOrHideIcon('show', 'username'), '显示')}
          </div>
        </Form.Item>
        <Form.Item className="account-info__form__item">
          <div className="account-info__label">用户ID</div>
          <div className="account-info__show">
            {renderCopyItem(
              <span className="account-info__text" onClick={() => userId && onCopy(userId)}>
                {showUserId ? userId : new Array(userIdLen).fill('*')}
              </span>,
              '复制'
            )}
            {showUserId
              ? renderCopyItem(renderShowOrHideIcon('hide', 'userId'), '隐藏')
              : renderCopyItem(renderShowOrHideIcon('show', 'userId'), '显示')}
          </div>
        </Form.Item>
        <Form.Item className="account-info__form__item">
          <div className="account-info__label">用户邮箱</div>
          <div className="account-info__show">
            {renderCopyItem(
              <div className="account-info__text" onClick={() => email && onCopy(email)}>
                {showEmail ? email : new Array(emailLen).fill('*')}
              </div>,
              '复制'
            )}
            {showEmail
              ? renderCopyItem(renderShowOrHideIcon('hide', 'email'), '隐藏')
              : renderCopyItem(renderShowOrHideIcon('show', 'email'), '显示')}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export const WrapAccountInfo = Form.create<AccountInfoProps>({
  name: 'account-info',
})(AccountInfo);
