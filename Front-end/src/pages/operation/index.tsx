import React from 'react';
import { Avatar, Icon, Menu, Dropdown, message } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { screen } from '@/constants/screen';
import { apiGet } from '@/utils/request';
import { LOGOUT } from '@/constants/urls';
import { Action } from '@/redux/actions';
import { SelectParam } from 'antd/lib/menu';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { SocketState } from '@/redux/reducers/state';
import './index.less';

interface OperationProps extends RouteComponentProps {
  dispatch(action: Action): void;
  handleMenuChange(obj: SelectParam | { key: string }): void;
  username?: string;
  avatar?: string | null;
  uid?: string;
  socket: SocketState;
}

function Operation(props: OperationProps): any {
  const { handleMenuChange, username, avatar, dispatch, uid, history, socket } = props;
  function handleClickItem() {
    const obj = {
      key: 'user',
    };
    handleMenuChange(obj);
  }

  // 「退出登录」
  const handleLogout = async () => {
    try {
      await apiGet(LOGOUT);
      message.success('退出成功');

      if (socket) {
        socket.close();
      }
      dispatch({
        type: 'INSERT_SOCKET',
        payload: null,
      });
      dispatch({
        type: 'GET_USERINFO',
        payload: null,
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: false,
      });
      dispatch({
        type: 'CHANGE_SELECT_MENU',
        payload: '',
      });
      history.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const menu = (
    <Menu className="user-operation-menu" selectable={false}>
      <Menu.Item key="0" onClick={handleClickItem} className="user-operation-menu__item">
        <Link to={`/user/${uid}`} className="user-operation-menu__item__text">
          个人信息
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="change-password" className="user-operation-menu__item">
        <div className="user-operation-menu__item__text">修改密码</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" className="user-operation-menu__item">
        <div className="user-operation-menu__item__text" onClick={handleLogout}>
          退出登录
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="user-operation">
      <span className="user-operation__nick-name">{username}</span>
      <div className="user-operation__avatar">
        <Avatar
          className={screen.isLittleScreen ? 'user-operation__avatar__img--small' : 'user-operation__avatar__img'}
          src={avatar || defaultAvatar}
        />
        <Dropdown overlay={menu} trigger={screen.isLittleScreen ? ['click'] : ['hover']}>
          <a
            className="ant-dropdown-link"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Icon type="down" className="user-operation__avatar__icon" />
          </a>
        </Dropdown>
      </div>
    </div>
  );
}

export const WrapOperation = withRouter(Operation as any);
