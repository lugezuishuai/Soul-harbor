import React from 'react';
import { Form, Tooltip, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Show from '@/assets/icon/show.svg';
import Hide from '@/assets/icon/hide.svg';
import style from '../index.less';
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
  const userNameLen = userName.length;        // 用户名的长度
  const userIdLen = userId.length;            // 用户ID的长度

  return (
    <div className="account_info">
      <div className={style.info_title}>
        <span className={style.info_title_text}>账号信息</span>
      </div>
      <Form className={style.info_form}>
        <Form.Item className={style.info_form_item}>
          <label htmlFor="username" className="account_info_label">账号</label>
          <div className="account_info_show">
            <span className="account_info_text">{ showUserName ? userName : new Array(userNameLen).fill('*') }</span>
            { showUserName ? 
              <Tooltip title="隐藏">
                <Icon component={Hide as any} onClick={handleShowUserName} className="account_info_show_hide"/>
              </Tooltip> : 
              <Tooltip title="显示">
                <Icon component={Show as any} onClick={handleShowUserName} className="account_info_show_hide"/>
              </Tooltip> 
            }
          </div>
        </Form.Item>
        <Form.Item className={style.info_form_item}>
          <label htmlFor="userId" className="account_info_label">用户ID</label>
          <div className="account_info_show">
            <span className="account_info_text">{ showUserId ? userId : new Array(userIdLen).fill('*') }</span>
            { showUserId ? 
              <Tooltip title="隐藏">
                <Icon component={Hide as any} onClick={handleShowUserId} className="account_info_show_hide"/>
              </Tooltip> : 
              <Tooltip title="显示">
                <Icon component={Show as any} onClick={handleShowUserId} className="account_info_show_hide"/>
              </Tooltip> 
            }
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

const WrapAccountInfo = Form.create<Props>({
  name: 'account_info'
})(AccountInfo);

export default WrapAccountInfo;