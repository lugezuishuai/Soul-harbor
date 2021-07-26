import React, { useCallback, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { Redirect, Route, Switch } from 'react-router-dom';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Employee from '@/pages/employee';
import UploadFile from '@/pages/upload';
import Content from '@/pages/home/content';
import UserInfo from '@/pages/user-info';
import Header from './header';
import { Footer } from './footer';
import ResetPw from '@/pages/updatePassword';
import { NotFound } from '@/pages/not-found';
import { NoPermission } from '@/pages/no-permission';
import { Error } from '@/pages/error-page';
import { WrapWithLogin } from '@/components/with-login';
import { WrapScrollToTop } from './scroll-to-top';
import { apiGet } from '@/utils/request';
import { GET_UNREAD_MSG, XSRFINIT } from '@/constants/urls';
import { WrapChatPage } from '@/pages/chat';
import { Action } from '@/redux/actions';
import { LoginState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { GetUnreadMsgRes } from '@/interface/chat/getUnreadMsg';
import { UNREAD_MESSAGE_COUNT } from '@/redux/actions/action_types';
import './index.less';

interface WrapChatInfoPageProps {
  updateUnreadMsg(): Promise<any>;
}

function WrapUserInfo() {
  return (
    <WrapWithLogin noLoginPlaceholder={<NoPermission className="wrap-exception" />}>
      <UserInfo />
    </WrapWithLogin>
  );
}

function WrapChatInfoPage({ updateUnreadMsg }: WrapChatInfoPageProps) {
  return (
    <WrapWithLogin noLoginPlaceholder={<NoPermission className="wrap-exception" />}>
      <WrapChatPage updateUnreadMsg={updateUnreadMsg} />
    </WrapWithLogin>
  );
}

interface HomeProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfoState;
  login: LoginState;
  socket: SocketState;
}

function Home(props: HomeProps) {
  const { userInfo, selectMenu, login, socket, dispatch } = props;

  // 初始化xsrf
  const initXsrf = useCallback(async () => {
    try {
      await apiGet(XSRFINIT);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 更新离线信息
  const updateUnreadMsg = useCallback(async () => {
    try {
      if (login) {
        const {
          data: { unreadPrivateMsg },
        }: GetUnreadMsgRes = await apiGet(GET_UNREAD_MSG);
        let count = 0;
        if (unreadPrivateMsg) {
          Object.values(unreadPrivateMsg).forEach((value) => {
            count += value.length;
          });
        }

        dispatch({
          type: UNREAD_MESSAGE_COUNT,
          payload: count,
        });
        dispatch({
          type: GET_UNREAD_MSG,
          payload: unreadPrivateMsg,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [dispatch, login]);

  useEffect(() => {
    initXsrf();

    return () => {
      if (socket) {
        // @ts-ignore
        socket.removeAllListeners(); // 移除所有监听
      }
    };
  }, [initXsrf, socket]);

  useEffect(() => {
    updateUnreadMsg();
  }, [updateUnreadMsg]);

  return (
    <ConfigProvider locale={zh_CN} prefixCls="ant">
      <div className="home-global">
        <Switch>
          <Route path="/exception/403" exact component={NoPermission} />
          <Route path="/exception/404" exact component={NotFound} />
          <Route path="/exception/500" exact component={Error} />
          <Route path="/reset/:token" exact component={ResetPw} />
          <Route path="/">
            <div className="home-global__header">
              <Header dispatch={dispatch} selectMenu={selectMenu} userInfo={userInfo} login={login} socket={socket} />
              <div className="home-global__divide" />
            </div>
            <div className="home-global__container">
              <div className="home-global__content">
                <WrapScrollToTop>
                  <Switch>
                    <Route path="/" exact component={Content} />
                    <Route path="/home" exact component={Content} />
                    <Route path="/chat" component={() => <WrapChatInfoPage updateUnreadMsg={updateUnreadMsg} />} />
                    <Route path="/news" exact component={UploadFile} />
                    <Route path="/blog" exact component={Employee} />
                    <Route path="/user/:id" exact component={WrapUserInfo} />
                    <Redirect to="/exception/404" />
                  </Switch>
                </WrapScrollToTop>
              </div>
              <Footer />
            </div>
          </Route>
        </Switch>
      </div>
    </ConfigProvider>
  );
}

export default connect(
  ({ header: { selectMenu }, user: { userInfo, login }, chat: { socket, unreadChatMessage } }: State) => ({
    selectMenu,
    userInfo,
    login,
    socket,
    unreadChatMessage,
  })
)(Home);
