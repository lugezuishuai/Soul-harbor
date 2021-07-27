import React, { useCallback, useEffect, useState } from 'react';
import { Action } from '@/redux/actions';
import { LoginState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { connect } from 'react-redux';
import { apiGet } from '@/utils/request';
import { GET_UNREAD_MSG, XSRFINIT } from '@/constants/urls';
import { GetUnreadMsgRes } from '@/interface/chat/getUnreadMsg';
import { UNREAD_MESSAGE_COUNT } from '@/redux/actions/action_types';
import { RouteType } from '@/config/types/route-type';
import Header from '@/pages/home/header';
import { Footer } from '@/pages/home/footer';
import { WrapScrollToTop } from './scroll-to-top';
import { renderRoutes } from '@/utils/routers/renderRoutes';
import { State } from '@/redux/reducers/state';
import { NoPermission } from '../no-permission';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import './index.less';

interface HomeProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfoState;
  login: LoginState;
  socket: SocketState;
  route: RouteType;
}

function Home(props: HomeProps) {
  const { userInfo, selectMenu, login, socket, dispatch, route } = props;
  const [authed, setAuthed] = useState<string[]>([]); // 当前用户所拥有的权限

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

  useEffect(() => {
    if (!isNullOrUndefined(login)) {
      if (login) {
        setAuthed(['login']);
      } else {
        setAuthed([]);
      }
    }
  }, [login]);

  return (
    <>
      <div className="home__header">
        <Header dispatch={dispatch} selectMenu={selectMenu} userInfo={userInfo} login={login} socket={socket} />
        <div className="home__divide" />
      </div>
      <div className="home__container">
        <div className="home__content">
          <WrapScrollToTop>
            {route.routes?.length && !isNullOrUndefined(login) && renderRoutes(route.routes, authed)}
          </WrapScrollToTop>
        </div>
        <Footer />
      </div>
    </>
  );
}

export const WrapNoPermission = <NoPermission className="wrap-exception" />;
export const WrapHome = connect(
  ({ header: { selectMenu }, user: { userInfo, login }, chat: { socket, unreadChatMessage } }: State) => ({
    selectMenu,
    userInfo,
    login,
    socket,
    unreadChatMessage,
  })
)(Home);
