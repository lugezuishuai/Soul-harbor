import { Action } from '@/redux/actions';
import {
  ActiveMenuState,
  ActiveMsgState,
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
import { apiGet, apiPost } from '@/utils/request';
import {
  DELETE_FRIEND,
  GET_FRIENDS_LIST,
  GET_GROUPS_LIST,
  GET_SESSIONS_LIST,
  GET_SESSION_INFO,
} from '@/constants/urls';
import {
  ACTIVE_MSG,
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
import { FriendCard } from './component/friendCard';
import { SessionCard, SessionCardSkeleton } from './component/sessionCard';
import GroupChat from '@/assets/icon/group_chat.svg';
import { Icon, Button, Modal, message } from 'antd';
import { openGroupChatModal } from './component/openGroupChatModal';
import { GetGroupsListRes } from '@/interface/chat/getGroupsList';
import { RoomCard } from './component/roomCard';
import { GetSessionInfoReq, GetSessionInfoRes } from '@/interface/chat/getSessionInfo';
import { ActiveMsg } from './component/activeMsg';
import { WrapChatPageProps } from '.';
import { screen } from '@/constants/screen';
import { matchPath } from 'react-router-dom';
import { ChatSessionsMobileProps } from './mobile/pages/sessions';
import { ChatContractsMobileProps } from './mobile/pages/contracts';
import { ConversationMobileProps } from './mobile/pages/conversation';
import { ChatFooterMobile } from './mobile/components/chat-footer';
import { AddFriendsMobileProps } from './mobile/pages/add-friend';
import { LaunchGroupChatProps } from './mobile/pages/launch-group-chat';
import { ContractCardSkeleton } from './component/contractCardSkeleton';
import { DeleteFriendReq } from '@/interface/chat/deleteFriend';
import Cookies from 'js-cookie';
import { FoldingPanel } from '@/components/folding-panel';
import { renderRoutes } from '@/routers/renderRoutes';
import { RouteType } from '@/routers/config';
import './index.less';

const { confirm } = Modal;
const { isMobile } = screen;

interface ChatPageProps extends WrapChatPageProps {
  dispatch(action: Action): void;
  updateUnreadMsg(): Promise<void>;
  userInfo: UserInfoState;
  activeMenu: ActiveMenuState;
  isSearch: boolean;
  socket: SocketState;
  friendsList: FriendListState;
  groupsList: GroupsListState;
  sessionsList: SessionsListState;
  selectSession: SelectSessionState;
  activeSession: string[];
  activeMsg: ActiveMsgState;
  unreadChatMsgCount: number;
  friendsListFold: boolean;
  groupsListFold: boolean;
  route: RouteType;
  authed: string[];
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
  const {
    history,
    location,
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
    activeMsg,
    unreadChatMsgCount,
    friendsListFold,
    groupsListFold,
    updateUnreadMsg,
    route,
    authed,
  } = props;
  const isSessionsMenu = activeMenu === 'sessions' && !isSearch;
  const isContractsMenu = activeMenu === 'contracts' && !isSearch;
  const showChatFooter =
    matchPath(location.pathname, { path: '/chat/sessions', exact: true }) ||
    matchPath(location.pathname, { path: '/chat/contracts', exact: true });

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
  const locationRef = useRef(location);
  const historyRef = useRef(history);

  const handleFriendsListFold = useCallback(() => {
    dispatch({
      type: FRIENDS_LIST_FOLD,
      payload: !friendsListFold,
    });
  }, [dispatch, friendsListFold]);

  const handleGroupsListFold = useCallback(() => {
    dispatch({
      type: GROUPS_LIST_FOLD,
      payload: !groupsListFold,
    });
  }, [dispatch, groupsListFold]);

  function renderSearchPage() {
    if (searchLoading) {
      const array = new Array(10).fill(0);
      return (
        <div className="chat-page__left-content">
          {array.map((o, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      );
    } else if (!searchData) {
      return <div className="chat-page__left-content" />;
    } else if (!searchData.membersInfo.length) {
      return <NoSearchResult />;
    } else {
      return searchData.membersInfo.map((userData, index) => (
        <UserCard
          key={index}
          userData={userData}
          getFriendsList={getFriendsList}
          friendsList={friendsList}
          dispatch={dispatch}
          socket={socket}
          username={userInfo?.username || ''}
          keyword={searchData.keyword}
          selectSession={selectSession}
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
      const array = new Array(5).fill(0);
      return (
        <div className="chat-page__left-contracts">
          <FoldingPanel handleFold={handleFriendsListFold} foldState={friendsListFold} textContent="好友" />
          <div className="chat-page__left-contracts__item">
            {array.map((o, i) => (
              <ContractCardSkeleton key={i} />
            ))}
          </div>
          <FoldingPanel handleFold={handleGroupsListFold} foldState={groupsListFold} textContent="群组" />
          <div className="chat-page__left-contracts__item">
            {array.map((o, i) => (
              <ContractCardSkeleton key={i} />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <>
          <FoldingPanel handleFold={handleFriendsListFold} foldState={friendsListFold} textContent="好友" />
          {!friendsListFold &&
            newFriendsList.map((friendInfo) => (
              <FriendCard
                key={friendInfo.friend_id}
                friendInfo={friendInfo}
                dispatch={dispatch}
                deleteFriend={deleteFriend}
                selectSession={selectSession}
              />
            ))}
          <FoldingPanel handleFold={handleGroupsListFold} foldState={groupsListFold} textContent="群组" />
          {!groupsListFold &&
            groupsList?.length &&
            groupsList.map((groupInfo) => (
              <RoomCard
                key={groupInfo.room_id}
                roomInfo={groupInfo}
                dispatch={dispatch}
                selectSession={selectSession}
              />
            ))}
        </>
      );
    }
  }

  function renderSessionsList() {
    if (sessionsLoading) {
      const array = new Array(10).fill(0);
      return (
        <div className="chat-page__left-content">
          {array.map((o, i) => (
            <SessionCardSkeleton key={i} />
          ))}
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
            <SessionCard
              key={index}
              sessionInfo={sessionInfo}
              activeSession={activeSession}
              dispatch={dispatch}
              selectSession={selectSession}
            />
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
  }, [dispatch, setSessionsLoading]);

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
  }, [dispatch, setFriendsLoading]);

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
  }, [dispatch, setGroupsLoading]);

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
    [dispatch],
  );

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

  // 删除好友
  const deleteFriend = useCallback(
    async (id: string) => {
      try {
        const reqData: DeleteFriendReq = {
          friendId: id,
        };

        await apiPost(DELETE_FRIEND, reqData);
        if (id === selectSession?.sessionId) {
          dispatch({
            type: SELECT_SESSION,
            payload: null,
          });
        }

        // 删除会话信息
        dispatch({
          type: DELETE_SESSION_INFO,
          payload: id,
        });

        // 删除好友信息
        dispatch({
          type: DELETE_FRIEND_ACTION,
          payload: id,
        });

        // 发送删除好友信息
        if (socket) {
          socket.emit('update friend', Cookies.get('uuid') || '', id, userInfo?.username || '', 'delete');
        }

        message.success('删除成功');
      } catch (e) {
        console.error(e);
      }
    },
    [dispatch, selectSession?.sessionId, socket, userInfo?.username],
  );

  // 监听socket
  const listenSocket = useCallback(() => {
    if (!socket) {
      return;
    }

    // @ts-ignore
    socket.removeAllListeners(); // 一定要先移除原来的事件，否则会有重复的监听器
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
          dispatch({
            type: ACTIVE_MSG,
            payload: msg,
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
          dispatch({
            type: ACTIVE_MSG,
            payload: msg,
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
        isMobile && historyRef.current.goBack();
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
  }, [socket, updateSessionInfo, selectSession, setSessionMsg, dispatch, getFriendsList]);

  // 加入房间
  const joinRoom = useCallback(() => {
    if (groupsList && groupsList.length > 0 && socket) {
      const roomIds = groupsList.map((roomInfo) => roomInfo.room_id);
      socket.emit('join room', roomIds);
    }
  }, [groupsList, socket]);

  // 初始化selectSession(移动端不需要进行这一步)
  const initSelectSession = useCallback(async () => {
    if (isMobile) {
      return;
    }

    const pathnameArr = locationRef.current.pathname.split('/');
    const sessionId = pathnameArr[pathnameArr.length - 1];

    if (selectSession) {
      historyRef.current.push(`/chat/${selectSession.sessionId}`);
    } else {
      if (sessionId === 'chat' || sessionId === '') {
        return;
      } else if (sessionId === '0') {
        // 机器人聊天
        const session: SelectSession = {
          sessionId: '0',
          name: '机器人小X',
          type: 'private',
        };

        dispatch({
          type: SELECT_SESSION,
          payload: session,
        });
      } else {
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
    }
  }, [friendsList, groupsList, dispatch, selectSession]);

  // 定义routes组件的props
  const chatSessionsMobileProps: ChatSessionsMobileProps = {
    dispatch,
    unreadChatMsgCount,
    sessionsList,
    sessionsLoading,
    activeSession,
    selectSession,
  };

  const chatContractsMobileProps: ChatContractsMobileProps = {
    friendsLoading,
    groupsLoading,
    friendsListFold,
    groupsListFold,
    friendsList,
    groupsList,
    handleFriendsListFold,
    handleGroupsListFold,
    dispatch,
    deleteFriend,
    selectSession,
  };

  const addFriendsMobileProps: AddFriendsMobileProps = {
    history,
    dispatch,
    getFriendsList,
    friendsList,
    socket,
    username: userInfo?.username || '',
    selectSession,
  };

  const launchGroupChatProps: LaunchGroupChatProps = {
    getGroupsList,
    friendsList,
    userInfo,
    history,
  };

  const conversationMobileProps: Omit<ConversationMobileProps, 'form'> = {
    dispatch,
    getGroupsList,
    getSessionsList,
    updateUnreadMsg,
    socket,
    userInfo,
    selectSession,
    friendsList,
  };

  const renderRoutesExtraProps: Record<string, any>[] = [
    chatSessionsMobileProps,
    chatContractsMobileProps,
    addFriendsMobileProps,
    launchGroupChatProps,
    conversationMobileProps,
  ]; // 提供给renderRoutes的参数, 这里的顺序要和路由配置里面保持一致

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

  useEffect(() => {
    if (activeMsg) {
      const timer = setTimeout(() => {
        dispatch({
          type: ACTIVE_MSG,
          payload: null,
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [activeMsg, dispatch]);

  return isMobile ? (
    <div className="chat-page__mobile">
      {route.routes?.length && renderRoutes(route.routes, authed, renderRoutesExtraProps, `/chat/${activeMenu}`)}
      {showChatFooter && (
        <ChatFooterMobile activeMenu={activeMenu} dispatch={dispatch} history={history} location={location} />
      )}
    </div>
  ) : (
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
          {isSessionsMenu && renderSessionsList()}
          {isContractsMenu && renderContactsList()}
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
      {activeMsg && <ActiveMsg msg={activeMsg} friendsList={friendsList} groupsList={groupsList} dispatch={dispatch} />}
    </div>
  );
}

export const WrapChatPage = connect(
  ({
    user: { userInfo, authed },
    chat: {
      activeMenu,
      isSearch,
      socket,
      friendsList,
      groupsList,
      sessionsList,
      selectSession,
      activeSession,
      activeMsg,
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
    activeMsg,
    unreadChatMsgCount,
    friendsListFold,
    groupsListFold,
    authed,
  }),
)(ChatPage);
