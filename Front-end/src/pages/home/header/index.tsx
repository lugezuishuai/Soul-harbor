import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Button, Icon, Dropdown } from 'antd';
import DropdownMenu from '@/assets/icon/menu.svg';
import Heart from '@/assets/icon/heart.svg';
import { WrapSignUp } from '@/pages/sign-up';
import { WrapOperation } from '@/pages/operation';
import { apiGet } from '@/utils/request';
import { INIT } from '@/constants/urls';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { LoginState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { screen } from '@/constants/screen';
import { MenuItemType } from '@/pages/sign-up';
import { Skeleton } from '@/components/custom-skeleton';
import { WrapWithLogin } from '@/components/with-login';
import { SelectParam } from 'antd/lib/menu';
import { MenuConfig, loginMenu, noLoginMenu } from './menu-config';
import classnames from 'classnames';
import io from 'socket.io-client';
import './index.less';

const { Item, Divider } = Menu;

export interface HeaderProps extends RouteComponentProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfoState;
  login: LoginState;
  socket: SocketState;
}

const { Block, InlineBlock, Avatar } = Skeleton;

function UserSkeleton() {
  return screen.isLittleScreen ? (
    <Skeleton className="user-skeleton__mobile">
      <Block className="email-skeleton__mobile" />
      <Avatar className="avatar-skeleton__mobile" />
    </Skeleton>
  ) : (
    <Skeleton className="row-flex" style={{ marginRight: 24 }}>
      <InlineBlock className="email-skeleton" />
      <Avatar className="avatar-skeleton" />
      <InlineBlock className="dropdown-skeleton" />
    </Skeleton>
  );
}

function MenuSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'menu-skeleton')}>
      <InlineBlock className="menu-skeleton__item" />
      <InlineBlock className="menu-skeleton__item" />
      <InlineBlock className="menu-skeleton__item" />
      <InlineBlock className="menu-skeleton__item" />
    </Skeleton>
  );
}

function Header(props: HeaderProps) {
  const { selectMenu, dispatch, userInfo, login, location, socket } = props;
  const [visible, setVisible] = useState(false);
  const [signUpMenu, setSignUpMenu] = useState<MenuItemType | null>(null);
  const [loading, setLoading] = useState(true);

  function hideModal() {
    setVisible(false);
  }

  function handleClickLogin() {
    setVisible(true);
    setSignUpMenu('login');
  }

  function handleClickRegister() {
    setVisible(true);
    setSignUpMenu('register');
  }

  // 检查用户是否已经登录
  const checkLogin = useCallback(async () => {
    try {
      const res = await apiGet(INIT);
      const uid = res.data.userInfo?.uid?.slice(0, 8) || '';
      const socket = io(
        process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : `http://${process.env.REMOTE_HOST}`,
        { forceNew: true },
      );
      socket.emit('login', uid);
      // 建立socket连接
      dispatch({
        type: 'INSERT_SOCKET',
        payload: socket,
      });
      dispatch({
        type: 'GET_USERINFO',
        payload: {
          ...res.data.userInfo,
          uid,
        },
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: true,
      });
    } catch (e) {
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: false,
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  function handleMenuChange({ key }: SelectParam | { key: string }) {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: key,
    });
  }

  function renderHomeMenu(config: MenuConfig[], isMobile = false) {
    return (
      <Menu
        className={isMobile ? 'little-screen-menu' : 'home-menu'}
        mode={isMobile ? 'vertical' : 'horizontal'}
        selectedKeys={selectMenu ? [selectMenu] : []}
      >
        {isMobile
          ? config.map(({ key, to, text }, index, arr) => {
              return [
                <Item key={key} className="little-screen-menu__item">
                  {typeof to === 'function' ? (
                    <Link to={() => to(userInfo?.uid || '')}>{text}</Link>
                  ) : (
                    <Link to={to}>{text}</Link>
                  )}
                </Item>,
                index !== arr.length - 1 ? <Divider /> : null,
              ];
            })
          : config.map(({ key, to, text }) => {
              return (
                <Item key={key} className="home-menu__item">
                  {typeof to === 'function' ? (
                    <Link to={() => to(userInfo?.uid || '')}>{text}</Link>
                  ) : (
                    <Link to={to}>{text}</Link>
                  )}
                </Item>
              );
            })}
      </Menu>
    );
  }

  const mobileMenu = login ? renderHomeMenu(loginMenu, true) : renderHomeMenu(noLoginMenu, true);

  function renderUserState(login: boolean | null) {
    if (login && userInfo) {
      const { username, avatar, uid } = userInfo;
      return (
        <WrapOperation
          //@ts-ignore
          handleMenuChange={handleMenuChange}
          username={username}
          avatar={avatar}
          socket={socket}
          uid={uid}
          dispatch={dispatch}
        />
      );
    } else {
      if (screen.isLittleScreen) {
        return (
          <Button type="primary" className="home-user__login__mobile" onClick={handleClickLogin}>
            登录/注册
          </Button>
        );
      } else {
        return (
          <div className="home-user">
            <Button type="primary" className="home-user__login" onClick={handleClickLogin}>
              登录
            </Button>
            <Button className="home-user__login" onClick={handleClickRegister}>
              注册
            </Button>
          </div>
        );
      }
    }
  }

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  useEffect(() => {
    const pathArr = location.pathname.split('/');
    const activeMenu = pathArr[1];
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: activeMenu,
    });
  }, [location.pathname, dispatch]);

  return (
    <div className="home-header">
      {screen.isLittleScreen ? (
        <Dropdown overlay={mobileMenu} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            <Icon component={DropdownMenu as any} className="home-menu__little-icon" />
          </a>
        </Dropdown>
      ) : (
        <WrapWithLogin noLoginPlaceholder={renderHomeMenu(noLoginMenu)} loadingComponent={<MenuSkeleton />}>
          {renderHomeMenu(loginMenu)}
        </WrapWithLogin>
      )}
      <Link to="/" className="back-to-home">
        <Icon component={Heart as any} className="back-to-home__icon" />
        <span className="back-to-home__text">Soul Harbor</span>
      </Link>
      {loading ? <UserSkeleton /> : renderUserState(login)}
      {visible && <WrapSignUp dispatch={dispatch} menu={signUpMenu} visible={visible} hide={hideModal} />}
    </div>
  );
}

export default withRouter(Header);
