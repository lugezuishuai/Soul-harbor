import { Action } from '@/redux/actions';
import {
  ChatActiveMenuState,
  FriendListState,
  SelectSessionState,
  SessionsListState,
  SocketState,
  State,
  UserInfoState,
} from '@/redux/reducers/state';
import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { ChatNav } from './component/nav';
import { NoSearchResult, WrapChatSearch } from './component/search';
import { useChat } from './state';
import { UserCard, UserCardSkeleton } from './component/userCard';
import { WrapChatRoom } from './component/chat';
import { GetFriendsListRes } from '@/interface/chat/getFriendsList';
import { apiGet } from '@/utils/request';
import { GET_FRIENDS_LIST, GET_SESSIONS_LIST } from '@/constants/urls';
import { ACTIVE_SESSION, GET_FRIENDS_LIST_ACTION, GET_SESSIONS_LIST_ACTION } from '@/redux/actions/action_types';
import { GetSessionsListRes } from '@/interface/chat/getSessionsList';
import { MsgInfo } from '@/interface/chat/getHistoryMsg';
import { FriendCard, FriendCardSkeleton } from './component/friendCard';
import { SessionCard, SessionCardSkeleton } from './component/sessionCard';
import './index.less';

interface ChatPageProps {
  dispatch(action: Action): void;
  userInfo: UserInfoState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
  socket: SocketState;
  friendsList: FriendListState;
  sessionsList: SessionsListState;
  selectSession: SelectSessionState;
  activeSession: string[];
  unreadChatMsgCount: number;
}

function ChatPage(props: ChatPageProps) {
  const {
    userInfo,
    activeMenu,
    dispatch,
    isSearch,
    socket,
    friendsList,
    sessionsList,
    selectSession,
    activeSession,
    unreadChatMsgCount,
  } = props;
  const isChatMenu = activeMenu === 'chat' && !isSearch;
  const isFriendMenu = activeMenu === 'friend' && !isSearch;

  const {
    searchData,
    searchLoading,
    friendsLoading,
    sessionsLoading,
    setFriendsLoading,
    setSessionsLoading,
    setSessionMsg,
  } = useChat();

  function renderSearchPage() {
    if (searchLoading) {
      return (
        <div className="chat-page__left-content">
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
        </div>
      );
    } else if (!searchData) {
      return <div className="chat-page__left-content" />;
    } else if (!searchData.length) {
      return <NoSearchResult />;
    } else {
      return searchData.map((userData, index) => (
        <UserCard
          key={index}
          userData={userData}
          getFriendsList={getFriendsList}
          friendsList={friendsList}
          dispatch={dispatch}
        />
      ));
    }
  }

  function renderFriendsList() {
    if (friendsLoading) {
      return (
        <div className="chat-page__left-content">
          <FriendCardSkeleton />
          <FriendCardSkeleton />
          <FriendCardSkeleton />
          <FriendCardSkeleton />
          <FriendCardSkeleton />
          <FriendCardSkeleton />
        </div>
      );
    } else if (!friendsList || !friendsList.length) {
      return <div className="chat-page__left-content" />;
    } else {
      return friendsList.map((friendInfo, index) => (
        <FriendCard key={index} friendInfo={friendInfo} dispatch={dispatch} />
      ));
    }
  }

  function renderSessionsList() {
    if (sessionsLoading) {
      return (
        <div className="chat-page__left-content">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      );
    } else if (!sessionsList || !sessionsList.length) {
      return <div className="chat-page__left-content" />;
    } else {
      return sessionsList.map((sessionInfo, index) => (
        <SessionCard key={index} sessionInfo={sessionInfo} dispatch={dispatch} />
      ));
    }
  }

  // 获取会话列表
  const getSessionsList = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const result: GetSessionsListRes = await apiGet(GET_SESSIONS_LIST);
      console.log('sessions: ', result.data.sessionsList);
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
      console.log('friends: ', result.data.friendsList);
      if (result.data.friendsList) {
        dispatch({
          type: GET_FRIENDS_LIST_ACTION,
          payload: [...friendsList, ...result.data.friendsList],
        });
      }
      setFriendsLoading(false);
    } catch (e) {
      console.error(e);
      setFriendsLoading(false);
    }
  }, [dispatch]);

  // 监听socket
  const listenSocket = useCallback(() => {
    if (!socket) {
      return;
    }

    socket.on('receive message', (msg: MsgInfo) => {
      console.log('收到了来自服务器的消息： ', msg);
      const { sender_id } = msg;

      if (sender_id === selectSession?.sessionId) {
        // 如果在会话之中
        setSessionMsg(msg);
      } else {
        if (!activeSession.includes(sender_id)) {
          const newActiveSession = [...activeSession, sender_id];
          dispatch({
            type: ACTIVE_SESSION,
            payload: newActiveSession,
          });
        }
      }
    });
  }, [socket, activeSession, selectSession, dispatch]);

  useEffect(() => {
    getSessionsList();
    getFriendsList();
  }, [getSessionsList, getFriendsList]);

  useEffect(() => {
    listenSocket();
  }, [listenSocket]);

  return (
    <div className="chat-page">
      <ChatNav
        unreadChatMsgCount={unreadChatMsgCount}
        userInfo={userInfo}
        activeMenu={activeMenu}
        dispatch={dispatch}
      />
      <div className="chat-page__left">
        <WrapChatSearch isSearch={isSearch} dispatch={dispatch} />
        <div className="chat-page__left-container">
          {isChatMenu && renderSessionsList()}
          {isFriendMenu && renderFriendsList()}
          {isSearch && renderSearchPage()}
        </div>
      </div>
      <WrapChatRoom userInfo={userInfo} dispatch={dispatch} selectSession={selectSession} socket={socket} />
    </div>
  );
}

export const WrapChatPage = connect(
  ({
    user: { userInfo },
    chat: { activeMenu, isSearch, socket, friendsList, sessionsList, selectSession, activeSession, unreadChatMsgCount },
  }: State) => ({
    userInfo,
    activeMenu,
    isSearch,
    socket,
    friendsList,
    sessionsList,
    selectSession,
    activeSession,
    unreadChatMsgCount,
  })
)(ChatPage);
