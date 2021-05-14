import React, { useCallback, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Employee from '@/components/employee';
import UploadFile from '@/components/setting';
import Content from '@/components/home/content';
import UserInfo from '@/components/user-info';
import Header from './header';
import Footer from './footer';
import ResetPw from '@/pages/updatePassword';
import NotFound from '@/pages/not-found';
import NoPermission from '@/pages/no-permission';
import Error from '@/pages/error-page';
import { WrapWithLogin } from '@/components/with-login';
import { WrapScrollToTop } from './scroll-to-top';
import { apiGet } from '@/utils/request';
import { GET_UNREAD_MSG, XSRFINIT } from '@/constants/urls';
import { WrapChatPage } from '@/pages/chat';
import { Action } from '@/redux/actions';
import { LoginState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { UnreadMsg } from '@/interface/chat/getUnreadMsg';
import Cookies from 'js-cookie';
import './index.less';

function WrapUserInfo() {
  return (
    <WrapWithLogin noLoginPlaceholder={<NoPermission className="wrap-exception" />}>
      <UserInfo />
    </WrapWithLogin>
  );
}

function WrapChatInfoPage() {
  return (
    <WrapWithLogin noLoginPlaceholder={<NoPermission className="wrap-exception" />}>
      <WrapChatPage />
    </WrapWithLogin>
  );
}

interface HomeProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfoState;
  login: LoginState;
  socket: SocketState;
  unreadChatMessage: UnreadMsg;
}

function Home(props: HomeProps) {
  const { userInfo, selectMenu, login, socket, unreadChatMessage, dispatch } = props;

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
      const unreadMsg: UnreadMsg = await apiGet(GET_UNREAD_MSG);
      console.log('unreadMsg: ', unreadMsg);
      dispatch({
        type: GET_UNREAD_MSG,
        payload: unreadMsg,
      });
    } catch (e) {
      console.error(e);
    }
  }, [dispatch]);

  // // 更新未读信息
  // const updateUnreadMsg = useCallback(() => {
  //   if (!chatMessage) {
  //     return;
  //   }

  //   for (const key in chatMessage) {
  //     if (chatMessage.hasOwnProperty(key)) {
  //       const unreadMsg = chatMessage[key].some((msg) => msg.messageId !== msg.readMessageId); // 是否有未读信息
  //       if (unreadMsg) {
  //         // 有未读信息
  //         dispatch({
  //           type: UNREAD,
  //           payload: true,
  //         });
  //         break;
  //       }
  //     }
  //   }
  // }, [chatMessage, dispatch]);

  // // 监听socket
  // const listenSocket = useCallback(() => {
  //   if (!socket) {
  //     return;
  //   }

  //   socket.on('receive message', (msg: MessageBody) => {
  //     console.log('收到了来自服务器的信息: ', msg);
  //     try {
  //       const { senderId } = msg; // 获取发送者的uuid
  //       let newChatMessage;
  //       if (chatMessage) {
  //         newChatMessage = JSON.parse(JSON.stringify(chatMessage));
  //         if (newChatMessage && senderId && newChatMessage[senderId]) {
  //           newChatMessage[senderId].push(msg);
  //           newChatMessage[senderId].sort((a: MessageBody, b: MessageBody) => a.messageId - b.messageId);
  //         } else {
  //           newChatMessage[senderId] = [msg];
  //         }
  //       } else {
  //         newChatMessage = {
  //           [senderId]: [msg],
  //         };
  //       }

  //       dispatch({
  //         type: PRIVATE_CHAT,
  //         payload: newChatMessage,
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   });
  // }, [socket, chatMessage, dispatch]);

  useEffect(() => {
    initXsrf();
    updateUnreadMsg();

    return () => {
      console.log('home组件被销毁了');
      const uuid = Cookies.get('uuid');
      if (socket && uuid) {
        socket.emit('close', uuid);
        socket.close();
      }
    };
  }, [initXsrf, updateUnreadMsg, socket]);

  return (
    <ConfigProvider locale={zh_CN} prefixCls="ant">
      <div className="home-global">
        <Router>
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
                      <Route path="/home" exact component={Content} />
                      <Route path="/chat" exact component={WrapChatInfoPage} />
                      <Route path="/news" exact component={UploadFile} />
                      <Route path="/blog" exact component={Employee} />
                      <Route path="/user/:id" exact component={WrapUserInfo} />
                      <Redirect to="/home" />
                    </Switch>
                  </WrapScrollToTop>
                </div>
                <Footer />
              </div>
            </Route>
          </Switch>
        </Router>
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
