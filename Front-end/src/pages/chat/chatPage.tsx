import { Action } from '@/redux/actions';
import {
  ChatActiveMenuState,
  FriendListState,
  GroupsListState,
  SelectSession,
  SelectSessionState,
  SessionsListState,
  SocketState,
  State,
  UserInfoState,
} from '@/redux/reducers/state';
import React, { useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ChatNav } from './component/nav';
import { NoSearchResult, WrapChatSearch } from './component/search';
import { useChat } from './state';
import { UserCard, UserCardSkeleton } from './component/userCard';
import { WrapChatRoom } from './component/chat';
import { FriendInfo, GetFriendsListRes } from '@/interface/chat/getFriendsList';
import { apiGet } from '@/utils/request';
import { GET_FRIENDS_LIST, GET_GROUPS_LIST, GET_SESSIONS_LIST, GET_SESSION_INFO } from '@/constants/urls';
import {
  ACTIVE_SESSION,
  DELETE_FRIEND_ACTION,
  DELETE_SESSION_INFO,
  FRIENDS_LIST_FOLD,
  GET_FRIENDS_LIST_ACTION,
  GET_GROUPS_LIST_ACTION,
  GET_SESSIONS_LIST_ACTION,
  GROUPS_LIST_FOLD,
  SELECT_SESSION,
  UPDATE_SESSION_INFO,
} from '@/redux/actions/action_types';
import { GetSessionsListRes } from '@/interface/chat/getSessionsList';
import { MsgInfo } from '@/interface/chat/getHistoryMsg';
import { FriendCard, FriendCardSkeleton } from './component/friendCard';
import { SessionCard, SessionCardSkeleton } from './component/sessionCard';
import GroupChat from '@/assets/icon/group_chat.svg';
import { Icon, Button, Modal, message } from 'antd';
import { openGroupChatModal } from './component/openGroupChatModal';
import ArrowDown from '@/assets/icon/arrow_down.svg';
import { GetGroupsListRes } from '@/interface/chat/getGroupsList';
import { RoomCard, RoomCardSkeleton } from './component/roomCard';
import { GetSessionInfoReq, GetSessionInfoRes } from '@/interface/chat/getSessionInfo';
import { useHistory, useLocation } from 'react-router-dom';
import './index.less';

const { confirm } = Modal;

interface ChatPageProps {
  dispatch(action: Action): void;
  updateUnreadMsg(): Promise<any>;
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

interface UpdateFriend {
  msg: string;
  uuid: string;
}

export interface ActiveSessionPayload {
  type: 'add' | 'delete';
  value: string;
}

function ChatPage(props: ChatPageProps) {
  const locationRef = useRef(useLocation());
  const historyRef = useRef(useHistory());
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
    updateUnreadMsg,
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
          socket={socket}
          username={userInfo?.username || ''}
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
              <FriendCard
                key={index}
                friendInfo={friendInfo}
                dispatch={dispatch}
                selectSession={selectSession}
                socket={socket}
                username={userInfo?.username || ''}
              />
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
      return (
        <div className="chat-page__left-session">
          <Button type="primary" className="chat-page__left-btn" onClick={launchGroupChat}>
            <Icon className="chat-page__left-btn-icon" component={GroupChat as any} />
            <div className="chat-page__left-btn-text">发起群聊</div>
          </Button>
        </div>
      );
    } else {
      return (
        <>
          <Button type="primary" className="chat-page__left-btn" onClick={launchGroupChat}>
            <Icon className="chat-page__left-btn-icon" component={GroupChat as any} />
            <div className="chat-page__left-btn-text">发起群聊</div>
          </Button>
          {sessionsList.map((sessionInfo, index) => (
            <SessionCard key={index} sessionInfo={sessionInfo} activeSession={activeSession} dispatch={dispatch} />
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
      if (result.data.sessionsList) {
        const newSessionsList = result.data.sessionsList.sort((a, b) => b.latestTime - a.latestTime); // 按照latestTime降序排列
        dispatch({
          type: GET_SESSIONS_LIST_ACTION,
          payload: newSessionsList,
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

  // 获取群组列表
  const getGroupsList = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const result: GetGroupsListRes = await apiGet(GET_GROUPS_LIST);
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

  // 更新会话信息
  const updateSessionInfo = useCallback(
    async (sessionId: string, type: 'private' | 'room') => {
      const reqData: GetSessionInfoReq = {
        sessionId: sessionId,
        type: type,
      };

      const {
        data: { sessionInfo },
      }: GetSessionInfoRes = await apiGet(GET_SESSION_INFO, reqData);

      if (sessionInfo) {
        dispatch({
          type: UPDATE_SESSION_INFO,
          payload: sessionInfo,
        });
      }
    },
    [dispatch]
  );

  // 监听socket
  const listenSocket = useCallback(() => {
    if (!socket) {
      return;
    }

    // @ts-ignore
    socket.removeAllListeners(); //一定要先移除原来的事件，否则会有重复的监听器
    socket.on('receive message', (msg: MsgInfo) => {
      const { sender_id, receiver_id, private_chat } = msg;

      if (private_chat === 0) {
        // 私聊
        updateSessionInfo(sender_id, 'private');
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
        updateSessionInfo(receiver_id, 'room');
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

    socket.on('send message success', () => {
      if (selectSession) {
        updateSessionInfo(selectSession.sessionId, selectSession.type);
      }
    });

    socket.on('add friend', (value: UpdateFriend) => {
      const { msg } = value;
      message.success(msg);

      getFriendsList(); // 重新更新好友列表
    });

    socket.on('delete friend', (value: UpdateFriend) => {
      const { msg, uuid } = value;
      message.warn(msg);

      if (selectSession) {
        dispatch({
          type: SELECT_SESSION,
          payload: null,
        });
      }

      dispatch({
        type: DELETE_FRIEND_ACTION,
        payload: uuid,
      });

      dispatch({
        type: DELETE_SESSION_INFO,
        payload: uuid,
      });
    });
  }, [socket, selectSession, dispatch, updateSessionInfo, getGroupsList]);

  // 加入房间
  const joinRoom = useCallback(() => {
    if (groupsList && groupsList.length > 0 && socket) {
      const roomIds = groupsList.map((roomInfo) => roomInfo.room_id);
      socket.emit('join room', roomIds);
    }
  }, [groupsList, socket]);

  // 初始化selectSession
  const initSelectSession = useCallback(async () => {
    const pathnameArr = locationRef.current.pathname.split('/');
    const sessionId = pathnameArr[pathnameArr.length - 1];

    if (selectSession) {
      historyRef.current.push(`/chat/${selectSession.sessionId}`);
    } else {
      if (sessionId === 'chat' || sessionId === '') {
        return;
      }

      if (friendsList && groupsList) {
        const promiseFriend = new Promise((resolve, reject) => {
          if (!friendsList.length) {
            reject();
          }

          const friendInfo = friendsList.find((item) => item.friend_id === sessionId);

          if (friendInfo) {
            const { friend_id, friend_username } = friendInfo;
            const session: SelectSession = {
              sessionId: friend_id,
              name: friend_username,
              type: 'private',
            };
            resolve(session);
          } else {
            reject();
          }
        });

        const promiseGroup = new Promise((resolve, reject) => {
          if (!groupsList.length) {
            reject();
          }

          const groupInfo = groupsList.find((item) => item.room_id === sessionId);

          if (groupInfo) {
            const { room_id, room_name } = groupInfo;
            const session: SelectSession = {
              sessionId: room_id,
              name: room_name,
              type: 'room',
            };
            resolve(session);
          } else {
            reject();
          }
        });

        const result = await Promise.any([promiseFriend, promiseGroup]);

        dispatch({
          type: SELECT_SESSION,
          payload: result,
        });
      }
    }
  }, [friendsList, groupsList, dispatch, selectSession]);

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

  useEffect(() => {
    initSelectSession();
  }, [initSelectSession]);

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
        getSessionsList={getSessionsList}
        updateUnreadMsg={updateUnreadMsg}
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
