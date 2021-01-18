import React, { useState, useEffect } from 'react';
import { Menu, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import Heart from '@/assets/icon/heart.svg';
import SignUp from '@/components/signUp';
import Register from '@/components/register';
import ForgetPw from '@/components/forgetPassword';
import UserInfo from '@/components/Operation';
import { Link } from 'react-router-dom';
import style from '../index.less';
import { State } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';

interface Props {
  dispatch(action: Action): void;
  selectMenu: string;
}

function Header(props: Props) {
  const { selectMenu, dispatch } = props;
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
    setLogin(true);
  }, [login]);         // 每当login发生改变的时候就去请求一次

  const handleMenuChange = ({ key }: any) => {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: key,
    });
  }

  return (
    <div className={style.home_header}> 
      <Menu
        // theme="dark"
        mode="horizontal"
        className={style.home_menu}
        selectedKeys={selectMenu ? [selectMenu] : []}
        onSelect={handleMenuChange}
      >
        <Menu.Item key="user" className={style.home_menu_item}><Link to="/user">个人信息</Link></Menu.Item>
        <Menu.Item key="chat" className={style.home_menu_item}><Link to="/chat">聊天</Link></Menu.Item>
        <Menu.Item key="blog" className={style.home_menu_item}><Link to="/blog">博客</Link></Menu.Item>
        <Menu.Item key="news" className={style.home_menu_item}><Link to="/news">资讯</Link></Menu.Item>
      </Menu>
      <Link to="/" className={style.back_to_home}>
        <Icon component={Heart as any} className={style.back_to_home_icon}/>
        <span className={style.back_to_home_text}>Soul Harbor</span>
      </Link>
      { login ? <UserInfo handleMenuChange={handleMenuChange}/> : 
        (<div className={style.home_user}>
          <Button type="primary" className={style.home_login} onClick={handleSignUpClick}>登录</Button>
          <Button className={style.home_login} onClick={handleRegisterClick}>注册</Button>
        </div>)
      }
      { showSignUpModal && <SignUp visible={showSignUpModal} hide={hideSignUpModal} showForgetPwModal={showForgetPassword} /> }
      { showRegisterModal && <Register visible={showRegisterModal} hide={hideRegisterModal} showSignUpModal={handleSignUpClick} /> }
      { showForgetPwModal && <ForgetPw visible={showForgetPwModal} hide={hideForgetPassword} showSignUpModal={handleSignUpClick} username={username} /> }
    </div>
  )
}

export default connect((state: State) => ({
  selectMenu: state.header.selectMenu
}))(Header);