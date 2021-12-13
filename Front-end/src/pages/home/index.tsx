import React, { useCallback, useEffect } from 'react';
import { Action } from '@/redux/actions';
import { LoginState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { connect } from 'react-redux';
import { apiGet } from '@/utils/request';
import { GET_UNREAD_MSG } from '@/constants/urls';
import { GetUnreadMsgRes } from '@/interface/chat/getUnreadMsg';
import { SET_AUTHED, UNREAD_MESSAGE_COUNT } from '@/redux/actions/action_types';
import { RouteType } from '@/config/types/route-type';
import Header from '@/pages/home/header';
import { Footer } from '@/pages/home/footer';
import { WrapScrollToTop } from './scroll-to-top';
import { renderRoutes } from '@/utils/routers/renderRoutes';
import { State } from '@/redux/reducers/state';
import { NoPermission } from '../no-permission';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import './index.less';

export interface SetAuthedPayload {
  type: 'cover' | 'add' | 'delete';
  value: string[];
}

interface HomeProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfoState;
  login: LoginState;
  socket: SocketState;
  route: RouteType;
  authed: string[];
}

function Home(props: HomeProps) {
  const { userInfo, selectMenu, login, socket, dispatch, route, authed } = props;

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
    updateUnreadMsg();
  }, [updateUnreadMsg]);

  useEffect(() => {
    if (!isNullOrUndefined(login)) {
      login &&
        dispatch({
          type: SET_AUTHED,
          payload: {
            type: 'add',
            value: ['login'],
          } as SetAuthedPayload,
        });
    }
  }, [dispatch, login]);

  return (
    <>
      <div className="home-header">
        <Header dispatch={dispatch} selectMenu={selectMenu} userInfo={userInfo} login={login} socket={socket} />
        <div className="home-divide" />
      </div>
      <div className="home-container">
        <div className="home-content">
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
  ({ header: { selectMenu }, user: { userInfo, login, authed }, chat: { socket, unreadChatMessage } }: State) => ({
    selectMenu,
    userInfo,
    login,
    socket,
    unreadChatMessage,
    authed,
  }),
)(Home);
