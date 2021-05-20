import { Action } from '@/redux/actions';
import {
  ChatActiveMenuState,
  FriendListState,
  GroupsListState,
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
import { FriendInfo, GetFriendsListRes } from '@/interface/chat/getFriendsList';
import { apiGet } from '@/utils/request';
import { GET_FRIENDS_LIST, GET_GROUPS_LIST, GET_SESSIONS_LIST } from '@/constants/urls';
import {
  ACTIVE_SESSION,
  FRIENDS_LIST_FOLD,
  GET_FRIENDS_LIST_ACTION,
  GET_GROUPS_LIST_ACTION,
  GET_SESSIONS_LIST_ACTION,
  GROUPS_LIST_FOLD,
} from '@/redux/actions/action_types';
import { GetSessionsListRes } from '@/interface/chat/getSessionsList';
import { MsgInfo } from '@/interface/chat/getHistoryMsg';
import { FriendCard, FriendCardSkeleton } from './component/friendCard';
import { SessionCard, SessionCardSkeleton } from './component/sessionCard';
import GroupChat from '@/assets/icon/group_chat.svg';
import { Icon, Button, Modal } from 'antd';
import { openGroupChatModal } from './component/openGroupChatModal';
import ArrowDown from '@/assets/icon/arrow_down.svg';
import { GetGroupsListRes } from '@/interface/chat/getGroupsList';
import { RoomCard, RoomCardSkeleton } from './component/roomCard';
import './index.less';

const { confirm } = Modal;

interface ChatPageProps {
  dispatch(action: Action): void;
  userInfo: UserInfoState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
  socket: SocketState;
  friendsList: FriendListState;
  groupsList: GroupsListState;
  sessionsList: SessionsListState;
  selectSession: SelectSessionState;
  activeSession: string[];
  unreadChatMsgCount: number;
  friendsListFold: boolean;
  groupsListFold: boolean;
}

export interface ActiveSessionPayload {
  type: 'add' | 'delete';
  value: string;
}

function ChatPage(props: ChatPageProps) {
  const {
    userInfo,
    activeMenu,
    dispatch,
    isSearch,
    socket,
    friendsList,
    groupsList,
    sessionsList,
    selectSession,
    activeSession,
    unreadChatMsgCount,
    friendsListFold,
    groupsListFold,
  } = props;
  const isChatMenu = activeMenu === 'chat' && !isSearch;
  const isFriendMenu = activeMenu === 'friend' && !isSearch;

  const {
    searchData,
    searchLoading,
    friendsLoading,
    groupsLoading,
    sessionsLoading,
    setFriendsLoading,
    setGroupsLoading,
    setSessionsLoading,
    setSessionMsg,
  } = useChat();

  console.log('activeSession: ', activeSession);

  // 发起群聊
  async function launchGroupChat() {
    try {
      if (friendsList && friendsList.length >= 2) {
        await openGroupChatModal(friendsList, userInfo, getGroupsList);
      } else {
        confirm({
          title: '注意',
          content: '抱歉，发起群聊至少需要两名好友，您的好友数量不够',
          centered: true,
          okText: '确认',
          cancelText: '取消',
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleFriendsListFold() {
    dispatch({
      type: FRIENDS_LIST_FOLD,
      payload: !friendsListFold,
    });
  }

  function handleGroupsListFold() {
    dispatch({
      type: GROUPS_LIST_FOLD,
      payload: !groupsListFold,
    });
  }

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

  function renderContactsList() {
    const robotInfo: FriendInfo = {
      friend_id: '0',
      friend_username: '机器人小X',
      friend_avatar: null,
    };
    const newFriendsList = friendsList ? [robotInfo, ...friendsList] : [robotInfo];
    if (friendsLoading || groupsLoading) {
      return (
        <div className="chat-page__left-contracts">
          <div className="chat-page__left-fold" onClick={handleFriendsListFold}>
            <Icon
              className={friendsListFold ? 'chat-page__left-fold-icon_down' : 'chat-page__left-fold-icon_up'}
              component={ArrowDown as any}
            />
            <div className="chat-page__left-fold-text">好友</div>
          </div>
          <div className="chat-page__left-contracts__item">
            <FriendCardSkeleton />
            <FriendCardSkeleton />
            <FriendCardSkeleton />
            <FriendCardSkeleton />
          </div>
          <div className="chat-page__left-fold" onClick={handleGroupsListFold}>
            <Icon
              className={groupsListFold ? 'chat-page__left-fold-icon_down' : 'chat-page__left-fold-icon_up'}
              component={ArrowDown as any}
            />
            <div className="chat-page__left-fold-text">群组</div>
          </div>
          <div className="chat-page__left-contracts__item">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        </div>
      );
    } else {
      return (
        <>
          <div className="chat-page__left-fold" onClick={handleFriendsListFold}>
            <Icon
              className={friendsListFold ? 'chat-page__left-fold-icon_down' : 'chat-page__left-fold-icon_up'}
              component={ArrowDown as any}
            />
            <div className="chat-page__left-fold-text">好友</div>
          </div>
          {!friendsListFold &&
            newFriendsList.map((friendInfo, index) => (
              <FriendCard key={index} friendInfo={friendInfo} dispatch={dispatch} />
            ))}
          <div className="chat-page__left-fold" onClick={handleGroupsListFold}>
            <Icon
              className={groupsListFold ? 'chat-page__left-fold-icon_down' : 'chat-page__left-fold-icon_up'}
              component={ArrowDown as any}
            />
            <div className="chat-page__left-fold-text">群组</div>
          </div>
          {!groupsListFold &&
            groupsList &&
            groupsList.map((groupInfo, index) => <RoomCard key={index} roomInfo={groupInfo} dispatch={dispatch} />)}
        </>
      );
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
      return (
        <>
          <Button type="primary" className="chat-page__left-btn" onClick={launchGroupChat}>
            <Icon className="chat-page__left-btn-icon" component={GroupChat as any} />
            <div className="chat-page__left-btn-text">发起群聊</div>
          </Button>
          {sessionsList.map((sessionInfo, index) => (
            <SessionCard key={index} sessionInfo={sessionInfo} dispatch={dispatch} />
          ))}
        </>
      );
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
          payload: result.data.friendsList,
        });
      }
      setFriendsLoading(false);
    } catch (e) {
      console.error(e);
      setFriendsLoading(false);
    }
  }, [dispatch]);

  // 获取群组列表
  const getGroupsList = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const result: GetGroupsListRes = await apiGet(GET_GROUPS_LIST);
      console.log('groups: ', result.data.rooms);
      if (result.data.rooms) {
        dispatch({
          type: GET_GROUPS_LIST_ACTION,
          payload: result.data.rooms,
        });
      }
      setGroupsLoading(false);
    } catch (e) {
      console.error(e);
      setGroupsLoading(false);
    }
  }, [dispatch]);

  // 监听socket
  const listenSocket = useCallback(() => {
    if (!socket) {
      return;
    }

    socket.on('receive message', (msg: MsgInfo) => {
      const { sender_id, receiver_id, private_chat } = msg;
      console.log('receiver_id: ', receiver_id);

      if (private_chat === 0) {
        // 私聊
        if (sender_id === selectSession?.sessionId) {
          // 如果在会话之中
          setSessionMsg(msg);
        } else {
          const payload: ActiveSessionPayload = {
            type: 'add',
            value: sender_id,
          };
          dispatch({
            type: ACTIVE_SESSION,
            payload,
          });
        }
      } else {
        // 群聊
        if (receiver_id === selectSession?.sessionId) {
          // 如果在会话之中
          setSessionMsg(msg);
        } else {
          const payload: ActiveSessionPayload = {
            type: 'add',
            value: receiver_id,
          };
          dispatch({
            type: ACTIVE_SESSION,
            payload,
          });
        }
      }
    });
  }, [socket, selectSession, dispatch]);

  // 加入房间
  const joinRoom = useCallback(() => {
    if (groupsList && groupsList.length > 0 && socket) {
      const roomIds = groupsList.map((roomInfo) => roomInfo.room_id);
      socket.emit('join room', roomIds);
    }
  }, [groupsList, socket]);

  useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  useEffect(() => {
    getSessionsList();
    getFriendsList();
    getGroupsList();
  }, [getSessionsList, getFriendsList, getGroupsList]);

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
          {isFriendMenu && renderContactsList()}
          {isSearch && renderSearchPage()}
        </div>
      </div>
      <WrapChatRoom
        userInfo={userInfo}
        dispatch={dispatch}
        selectSession={selectSession}
        socket={socket}
        friendsList={friendsList}
        getGroupsList={getGroupsList}
      />
    </div>
  );
}

export const WrapChatPage = connect(
  ({
    user: { userInfo },
    chat: {
      activeMenu,
      isSearch,
      socket,
      friendsList,
      groupsList,
      sessionsList,
      selectSession,
      activeSession,
      unreadChatMsgCount,
      friendsListFold,
      groupsListFold,
    },
  }: State) => ({
    userInfo,
    activeMenu,
    isSearch,
    socket,
    friendsList,
    groupsList,
    sessionsList,
    selectSession,
    activeSession,
    unreadChatMsgCount,
    friendsListFold,
    groupsListFold,
  })
)(ChatPage);
