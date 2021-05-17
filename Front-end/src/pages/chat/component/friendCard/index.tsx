import React from 'react';
import { Skeleton } from '@/components/skeleton';
import classnames from 'classnames';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import { Avatar } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { SelectSession } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

interface FriendCardProps {
  friendInfo: FriendInfo;
  dispatch(action: Action): void;
}

export function FriendCard({ friendInfo, dispatch }: FriendCardProps) {
  const { friend_avatar, friend_id, friend_username } = friendInfo;

  function handleClick() {
    const selectSession: SelectSession = {
      type: 'private',
      sessionId: friend_id,
      name: friend_username,
    };

    dispatch({
      type: SELECT_SESSION,
      payload: selectSession,
    });
  }

  return (
    <div className="chat-friend-card" onClick={handleClick}>
      <Avatar className="chat-friend-card-avatar" src={friend_avatar || defaultAvatar} />
      <div className="chat-friend-card-name">{friend_username}</div>
    </div>
  );
}

export function FriendCardSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'chat-friend-card-skeleton')}>
      <AvatarSkeleton className="chat-friend-card-skeleton-avatar" />
      <Block className="chat-friend-card-skeleton-text" />
    </Skeleton>
  );
}
