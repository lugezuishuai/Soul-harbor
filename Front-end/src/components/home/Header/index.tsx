import React, { useState, useEffect } from 'react';
import { Menu, Button, Icon, Dropdown } from 'antd';
import { connect } from 'react-redux';
import DropdownMenu from '@/assets/icon/menu.svg';
import Heart from '@/assets/icon/heart.svg';
import SignUp from '@/components/signUp';
import Register from '@/components/register';
import ForgetPw from '@/components/forgetPassword';
import Operation from '@/components/Operation';
import { GetUserInfoResponse } from '@/interface/userInfo';
import { Link } from 'react-router-dom';
import { State } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { screen } from '@/constants/screen';
import './index.less';

interface Props {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: GetUserInfoResponse
}

function Header(props: Props) {
  const { selectMenu, dispatch, userInfo } = props;
  const { nickName, avatar } = userInfo;
  const [showSignUpModal, setShowSignUpModal] = useState(false);            // 控制'登录'弹窗是否可见
  const [showRegisterModal, setShowRegisterModal] = useState(false);        // 控制'注册'弹窗是否可见
  const [showForgetPwModal, setShowForgetPwModal] = useState(false);        // 控制'忘记密码'弹窗是否可见
  const [username, setUsername] = useState('');          // 用户名
  const [login, setLogin] = useState(false);                                // 判断用户是否已经登录

  // 登录弹窗配置
  const handleSignUpClick = () => setShowSignUpModal(true);
  const hideSignUpModal = () => setShowSignUpModal(false);

  // 登录弹窗配置
  const handleRegisterClick = () => setShowRegisterModal(true);
  const hideRegisterModal = () => setShowRegisterModal(false);

  // 忘记密码弹窗配置
  const showForgetPassword = (username: string) => {
    setShowForgetPwModal(true);
    setUsername(username);
  };
  const hideForgetPassword = () => setShowForgetPwModal(false);

  useEffect(() => {
    // 请求接口判断token是否过期，如果token没有过期则设置login为true，接着请求用户信息接口获取用户信息
    // 用户信息用redux来维护
    setLogin(false);
  }, [login]);         // 每当login发生改变的时候就去请求一次

  const handleMenuChange = ({ key }: any) => {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: key,
    });
  }

  const menu = (
    <Menu
      selectable={false}
      className="little_screen_menu"
    >
      <Menu.Item key="user" className="little_screen_menu_item"><Link to="/user">个人信息</Link></Menu.Item>
      <Menu.Divider />
      <Menu.Item key="chat" className="little_screen_menu_item"><Link to="/chat">聊天</Link></Menu.Item>
      <Menu.Divider />
      <Menu.Item key="blog" className="little_screen_menu_item"><Link to="/blog">博客</Link></Menu.Item>
      <Menu.Divider />
      <Menu.Item key="news" className="little_screen_menu_item"><Link to="/news">资讯</Link></Menu.Item>
    </Menu>
  )

  return (
    <div className="home_header"> 
      { screen.isLittleScreen ? (
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
      <Link to="/" className="back_to_home">
        <Icon component={Heart as any} className="back_to_home_icon"/>
        <span className="back_to_home_text">Soul Harbor</span>
      </Link>
      { login ? <Operation handleMenuChange={handleMenuChange} nickName={nickName} avatar={avatar}/> : 
        (<div className="home_user">
          <Button type="primary" className="home_user_login" onClick={handleSignUpClick}>登录</Button>
          <Button className="home_user_login" onClick={handleRegisterClick}>注册</Button>
        </div>)
      }
      { showSignUpModal && <SignUp visible={showSignUpModal} hide={hideSignUpModal} showForgetPwModal={showForgetPassword} /> }
      { showRegisterModal && <Register visible={showRegisterModal} hide={hideRegisterModal} showSignUpModal={handleSignUpClick} /> }
      { showForgetPwModal && <ForgetPw visible={showForgetPwModal} hide={hideForgetPassword} showSignUpModal={handleSignUpClick} username={username} /> }
    </div>
  )
}

export default connect((state: State) => ({
  selectMenu: state.header.selectMenu,
  userInfo: state.user.userInfo,
}))(Header);