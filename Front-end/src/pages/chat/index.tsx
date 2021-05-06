import { Action } from '@/redux/actions';
import { ChatActiveMenuState, LoginState, State, UserInfoState } from '@/redux/reducers/state';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { ChatNav } from './component/nav';

interface ChatPageProps {
  dispatch(action: Action): void;
  login: LoginState;
  userInfo: UserInfoState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
}

function ChatPage(props: ChatPageProps) {
  const { login, userInfo, activeMenu, dispatch } = props;
  return (
    <div className="chat-page">
      <ChatNav userInfo={userInfo} activeMenu={activeMenu} dispatch={dispatch} />
    </div>
  );
}

export const WrapChatPage = connect(({ user: { login, userInfo }, chat: { activeMenu, isSearch } }: State) => ({
  login,
  userInfo,
  activeMenu,
  isSearch,
}))(ChatPage);
