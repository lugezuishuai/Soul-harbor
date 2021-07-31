import React from 'react';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import { Avatar, Icon, Modal } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { SelectSession } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import robotAvatar from '@/assets/image/robot.png';
import DeleteFriend from '@/assets/icon/delete_friend.svg';
import './index.less';

const { confirm } = Modal;

interface FriendCardProps {
  handleShowDrawer?(friendInfo: FriendInfo): void;
  dispatch(action: Action): void;
  deleteFriend(id: string): Promise<void>;
  friendInfo: FriendInfo;
}

export function FriendCard({ friendInfo, dispatch, handleShowDrawer, deleteFriend }: FriendCardProps) {
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

  function handleDeleteFriend(e: any) {
    // 阻止点击事件冒泡
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (handleShowDrawer) {
      handleShowDrawer(friendInfo);
    } else {
      confirm({
        title: '注意',
        content: `您确定要删除您的好友 ${friend_username} 吗？`,
        centered: true,
        okText: '确认',
        cancelText: '取消',
        onOk: () => deleteFriend(friend_id),
      });
    }
  }

  return (
    <div className="chat-friend-card" onClick={handleClick}>
      <Avatar
        className="chat-friend-card-avatar"
        src={friend_id !== '0' ? friend_avatar || defaultAvatar : robotAvatar}
      />
      <div className="chat-friend-card-name">{friend_username}</div>
      {friend_id !== '0' && (
        <Icon className="chat-friend-card-delete" component={DeleteFriend as any} onClick={handleDeleteFriend} />
      )}
    </div>
  );
}
