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
import { XSRFINIT } from '@/constants/urls';
import { WrapChatPage } from '@/pages/chat';
import { Action } from '@/redux/actions';
import { ChatMessageState, LoginState, MessageBody, SocketState, UserInfoState } from '@/redux/reducers/state';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { deepClone } from '@/utils/deepClone';
import { PRIVATE_CHAT, UNREAD } from '@/redux/actions/action_types';
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
  chatMessage: ChatMessageState;
  unread: boolean;
}

function Home(props: HomeProps) {
  const { userInfo, selectMenu, login, socket, unread, chatMessage, dispatch } = props;

  const initXsrf = useCallback(async () => {
    try {
      await apiGet(XSRFINIT);
      console.log('xsrfToken init success');
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    initXsrf();

    if (chatMessage) {
      // 判断是否有未读信息
      for (const key in chatMessage) {
        if (chatMessage.hasOwnProperty(key)) {
          const unread = chatMessage[key].some((msg) => msg.messageId !== msg.readMessageId); // 是否有未读信息
          if (unread) {
            // 有未读信息
            dispatch({
              type: UNREAD,
              payload: true,
            });
            break;
          }
        }
      }
    }

    if (socket) {
      socket.on('receive message', (msg: MessageBody) => {
        const { receiveId } = msg;
        let newChatMessage;
        if (chatMessage) {
          newChatMessage = deepClone(chatMessage);
          if (newChatMessage) {
            if (newChatMessage.hasOwnProperty(receiveId)) {
              // @ts-ignore
              newChatMessage[receiveId] = msg[receiveId].concat(msg);
            } else {
              // @ts-ignore
              newChatMessage[receiveId] = [msg];
            }
          }
        } else {
          newChatMessage = {
            receiveId: [msg],
          };
        }

        dispatch({
          type: PRIVATE_CHAT,
          payload: newChatMessage,
        });
      });
    }

    return () => {
      if (socket && userInfo?.uid) {
        // 关闭socket连接
        socket.emit('close', userInfo.uid);
        socket.close();
      }
    };
  }, [initXsrf]);

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
                <Header
                  dispatch={dispatch}
                  selectMenu={selectMenu}
                  userInfo={userInfo}
                  login={login}
                  socket={socket}
                  unread={unread}
                />
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
  ({ header: { selectMenu }, user: { userInfo, login }, chat: { socket, chatMessage, unread } }: State) => ({
    selectMenu,
    userInfo,
    login,
    socket,
    chatMessage,
    unread,
  })
)(Home);
