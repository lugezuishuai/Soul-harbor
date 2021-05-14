import { Action } from '@/redux/actions';
import {
  ChatActiveMenuState,
  FriendListState,
  SessionsListState,
  SocketState,
  State,
  UserInfoState,
} from '@/redux/reducers/state';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ChatNav } from './component/nav';
import { NoSearchResult, WrapChatSearch } from './component/search';
import { useChat } from './state';
import { UserCard } from './component/userCard';
import { WrapChatRoom } from './component/chat';
import { GetFriendsListRes } from '@/interface/chat/getFriendsList';
import { apiGet } from '@/utils/request';
import { GET_FRIENDS_LIST, GET_SESSIONS_LIST } from '@/constants/urls';
import { GET_FRIENDS_LIST_ACTION, GET_SESSIONS_LIST_ACTION } from '@/redux/actions/action_types';
import { GetSessionsListRes } from '@/interface/chat/getSessionsList';
import './index.less';

interface ChatPageProps {
  dispatch(action: Action): void;
  userInfo: UserInfoState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
  socket: SocketState;
  friendsList: FriendListState;
  sessionsList: SessionsListState;
}

function ChatPage(props: ChatPageProps) {
  const { userInfo, activeMenu, dispatch, isSearch, socket, friendsList, sessionsList } = props;
  const isChatMenu = activeMenu === 'chat' && !isSearch;
  const isFriendMenu = activeMenu === 'friend' && !isSearch;

  const { searchData } = useChat();

  const [friendsLoading, setFriendsLoading] = useState(false); // 获取好友列表loading
  const [sessionsLoading, setSessionsLoading] = useState(false); // 获取会话列表loading

  function renderSearchPage() {
    if (!searchData) {
      return <div className="chat-page__left-search" />;
    } else if (!searchData.length) {
      return <NoSearchResult />;
    } else {
      return searchData.map((userData, index) => (
        <UserCard key={index} userData={userData} getFriendsList={getFriendsList} friendsList={friendsList} />
      ));
    }
  }

  // 获取会话列表
  const getSessionsList = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const result: GetSessionsListRes = await apiGet(GET_SESSIONS_LIST);
      if (result.data.sessionsList) {
        dispatch({
          type: GET_SESSIONS_LIST_ACTION,
          payload: result.data.sessionsList,
        });
      }
      setSessionsLoading(false);
    } catch (e) {
      console.error(e);
      setSessionsLoading(false);
    }
  }, [dispatch]);

  // 获取好友列表
  const getFriendsList = useCallback(async () => {
    try {
      setFriendsLoading(true);
      const result: GetFriendsListRes = await apiGet(GET_FRIENDS_LIST);
      if (result.data.friendsList) {
        dispatch({
          type: GET_FRIENDS_LIST_ACTION,
          payload: result.data.friendsList,
        });
      }
      setFriendsLoading(false);
    } catch (e) {
      console.error(e);
      setFriendsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getSessionsList();
    getFriendsList();
  }, [getSessionsList, getFriendsList]);

  return (
    <div className="chat-page">
      <ChatNav userInfo={userInfo} activeMenu={activeMenu} dispatch={dispatch} />
      <div className="chat-page__left">
        <WrapChatSearch isSearch={isSearch} dispatch={dispatch} />
        <div className="chat-page__left-container">
          {isChatMenu && <div className="chat-page__left-chat"></div>}
          {isFriendMenu && <div className="chat-page__left-friend"></div>}
          {isSearch && renderSearchPage()}
        </div>
      </div>
      <WrapChatRoom userInfo={userInfo} dispatch={dispatch} unread={unread} chatMessage={chatMessage} socket={socket} />
    </div>
  );
}

export const WrapChatPage = connect(
  ({ user: { userInfo }, chat: { activeMenu, isSearch, socket, friendsList, sessionsList } }: State) => ({
    userInfo,
    activeMenu,
    isSearch,
    socket,
    friendsList,
    sessionsList,
  })
)(ChatPage);
