import React, { useState, useEffect } from 'react';
import { Menu, Button, Icon, Dropdown } from 'antd';
import { connect } from 'react-redux';
import DropdownMenu from '@/assets/icon/menu.svg';
import Heart from '@/assets/icon/heart.svg';
import { WrapSignUp } from '@/components/signUp';
import Operation from '@/components/Operation';
import { get } from '@/utils/request';
import { UserInfo, InitResponse } from '@/interface/user/init';
import { handleErrorMsg } from '@/utils/handleErrorMsg';
import { INIT } from '@/constants/urls';
import { Link } from 'react-router-dom';
import { State } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { screen } from '@/constants/screen';
import { MenuItem } from '@/components/signUp';
import './index.less';

interface Props {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfo;
  login: boolean;
}

function Header(props: Props) {
  const { selectMenu, dispatch, userInfo, login } = props;
  const { nickname, avatar } = userInfo;
  const [visible, setVisible] = useState(false);
  const [signUpMenu, setSignUpMenu] = useState<MenuItem | null>(null);

  const hideModal = () => setVisible(false);

  const handleClickLogin = () => {
    setVisible(true);
    setSignUpMenu('login');
  }

  const handleClickRegister = () => {
    setVisible(true);
    setSignUpMenu('register');
  }

  // 获取初始选中的菜单
  const setInitialMenu = () => {
    const pathArr = window.location.href.split('/');
    const activeMenu = pathArr[3];
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: activeMenu,
    })
  }

  useEffect(() => {
    // @ts-ignore
    get(INIT).then((res: InitResponse) => {
      dispatch({
        type: 'GET_USERINFO',
        payload: res.data.userInfo,
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: true,
      })
    }).catch(e => {
      handleErrorMsg(e);
    })
    setInitialMenu()
  }, []);

  const handleMenuChange = ({ key }: any) => {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: key,
    });
  }

  const handleBackHome = () => {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: '',
    })
  }

  const menu = (
    <Menu
      selectable={true}
      className="little_screen_menu"
      selectedKeys={selectMenu ? [selectMenu] : []}
      onSelect={handleMenuChange}
    >
      <Menu.Item key="user" className="little_screen_menu_item">
        <Link to="/user">个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="chat" className="little_screen_menu_item">
        <Link to="/chat">聊天</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="blog" className="little_screen_menu_item">
        <Link to="/blog">博客</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="news" className="little_screen_menu_item">
        <Link to="/news">资讯</Link>
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="home_header"> 
      {screen.isLittleScreen ? (
        <Dropdown overlay={menu} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <Icon component={DropdownMenu as any} className="home_menu_little_icon" />
          </a>
        </Dropdown>
      ) : (
        <Menu
          // theme="dark"
          mode="horizontal"
          className="home_menu"
          selectedKeys={selectMenu ? [selectMenu] : []}
          onSelect={handleMenuChange}
        >
          <Menu.Item key="user" className="home_menu_item"><Link to="/user">个人信息</Link></Menu.Item>
          <Menu.Item key="chat" className="home_menu_item"><Link to="/chat">聊天</Link></Menu.Item>
          <Menu.Item key="blog" className="home_menu_item"><Link to="/blog">博客</Link></Menu.Item>
          <Menu.Item key="news" className="home_menu_item"><Link to="/news">资讯</Link></Menu.Item>
        </Menu>
      )}
      <Link to="/" className="back_to_home" onClick={handleBackHome}>
        <Icon component={Heart as any} className="back_to_home_icon"/>
        <span className="back_to_home_text">Soul Harbor</span>
      </Link>
      {login ? <Operation handleMenuChange={handleMenuChange} nickName={nickname} avatar={avatar} /> : 
        screen.isLittleScreen ? 
          <Button type="primary" className="home_user_login__mobile" onClick={handleClickLogin}>登录/注册</Button> : 
          (<div className="home_user">
            <Button type="primary" className="home_user_login" onClick={handleClickLogin}>登录</Button>
            <Button className="home_user_login" onClick={handleClickRegister}>注册</Button>
          </div>)
      }
      {visible && menu && <WrapSignUp menu={signUpMenu} visible={visible} hide={hideModal} />}
    </div>
  )
}

export default connect((state: State) => ({
  selectMenu: state.header.selectMenu,
  userInfo: state.user.userInfo,
  login: state.user.login,
}))(Header);