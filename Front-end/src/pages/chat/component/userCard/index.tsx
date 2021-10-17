import React from 'react';
import { SearchMemberInfo } from '@/interface/chat/searchMember';
import { Avatar, Modal, message } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { FriendListState, SelectSession, SelectSessionState, SocketState } from '@/redux/reducers/state';
import { apiPost } from '@/utils/request';
import { AddFriendRequest } from '@/interface/chat/addFriend';
import { ADD_FRIEND } from '@/constants/urls';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import { Skeleton } from '@/components/skeleton';
import classnames from 'classnames';
import Cookies from 'js-cookie';
import { screen } from '@/constants/screen';
import { useHistory } from 'react-router-dom';
import { highlightKeyword } from '@/utils/highlightKeyword';
import './index.less';

const { confirm } = Modal;
const { Block, Avatar: AvatarSkeleton } = Skeleton;
const { isMobile, isSmallScreen, isLittleScreen } = screen;
const isMobilePhone = isSmallScreen || isLittleScreen;

interface UserCardProps {
  dispatch(action: Action): void;
  userData: SearchMemberInfo;
  friendsList: FriendListState;
  getFriendsList(): void;
  socket: SocketState;
  username: string;
  selectSession: SelectSessionState;
  needHighLight?: boolean;
  keyword?: string;
}

export function UserCard({
  userData,
  friendsList,
  getFriendsList,
  dispatch,
  socket,
  username,
  selectSession,
  keyword = '',
  needHighLight = true,
}: UserCardProps) {
  const { userInfo, online } = userData;
  const history = useHistory();

  // 添加好友
  async function handleAddFriend(friendId: string) {
    try {
      const reqData: AddFriendRequest = {
        friendId,
      };
      await apiPost(ADD_FRIEND, reqData);
      message.success(`您已成功添加${userInfo?.username || ''}为您的好友`);

      // 设置选定的会话，进入聊天页面
      const selectSession: SelectSession = {
        type: 'private',
        sessionId: userInfo?.uid || '',
        name: userInfo?.username || '',
      };
      dispatch({
        type: SELECT_SESSION,
        payload: selectSession,
      });
      isMobile && history.push(`/chat/conversation/${selectSession.sessionId}`);

      if (socket) {
        socket.emit('update friend', Cookies.get('uuid') || '', userInfo?.uid || '', username, 'add');
      }

      getFriendsList(); // 重新拉取一次好友列表
    } catch (e) {
      console.error(e);
    }
  }

  function handleClick() {
    const isFriend = friendsList?.find((friend) => friend.friend_id === userInfo?.uid);
    if (!isFriend) {
      confirm({
        title: '注意',
        content: '对不起，对方还不是您的好友，不能发起聊天。您要添加对方为您的好友吗？',
        centered: true,
        okText: '添加',
        cancelText: '取消',
        onOk: () => handleAddFriend(userInfo?.uid || ''),
      });
    } else {
      // 设置选定的会话，进入聊天页面
      if (selectSession) {
        const { sessionId } = selectSession;
        if (userInfo?.uid === sessionId) {
          isMobile && history.push(`/chat/conversation/${sessionId}`);
          return;
        }
      }

      if (!userInfo?.uid || !userInfo.username) {
        return;
      }

      const { uid, username } = userInfo;
      const newSelectSession: SelectSession = {
        type: 'private',
        sessionId: uid,
        name: username,
      };
      dispatch({
        type: SELECT_SESSION,
        payload: newSelectSession,
      });
      isMobile && history.push(`/chat/conversation/${newSelectSession.sessionId}`);
    }
  }

  return (
    <div className="chat-user-card" onClick={handleClick}>
      <div
        className="chat-user-card-online"
        style={
          isMobilePhone
            ? { backgroundColor: online ? '#1afa29' : '#BBBFC4', width: 6, height: 6 }
            : { backgroundColor: online ? '#1afa29' : '#BBBFC4' }
        }
      />
      <Avatar
        className="chat-user-card-avatar"
        src={userInfo?.avatar || defaultAvatar}
        style={isMobilePhone ? { height: 24, width: 24 } : {}}
      />
      <div className="chat-user-card-info">
        {needHighLight ? (
          <>
            <div className="chat-user-card-info-text">{highlightKeyword(userInfo?.username || '', keyword)}</div>
            <div className="chat-user-card-info-text">{highlightKeyword(userInfo?.email || '', keyword)}</div>
          </>
        ) : (
          <>
            <div className="chat-user-card-info-text">{userInfo?.username || ''}</div>
            <div className="chat-user-card-info-text">{userInfo?.email || ''}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'chat-user-card-skeleton')}>
      <AvatarSkeleton className="chat-user-card-skeleton-avatar" />
      <div className="chat-user-card-skeleton-info">
        <Block className="chat-user-card-skeleton-info__item" />
        <Block className="chat-user-card-skeleton-info__item" />
      </div>
    </Skeleton>
  );
}
