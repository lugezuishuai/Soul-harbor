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
  deleteFriend?(id: string): Promise<void>;
  dispatch(action: Action): void;
  friendInfo: FriendInfo;
  needHightLight?: boolean;
  showDelete?: boolean;
  keyword?: string;
}

export function FriendCard({
  friendInfo,
  dispatch,
  handleShowDrawer,
  deleteFriend,
  needHightLight = false,
  showDelete = true,
  keyword = '',
}: FriendCardProps) {
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

    if (!deleteFriend) {
      return;
    }

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

  // 高亮处理搜索关键字
  function highLightKeyword(value: string, keyword: string) {
    if (!keyword) {
      return value;
    }

    const regExp = new RegExp(keyword, 'g');
    return value.replace(regExp, `<span>${keyword}</span>`);
  }

  return (
    <div className="chat-friend-card" onClick={handleClick}>
      <Avatar
        className="chat-friend-card__avatar"
        src={friend_id !== '0' ? friend_avatar || defaultAvatar : robotAvatar}
      />
      {needHightLight ? (
        <div
          className="chat-friend-card__name"
          dangerouslySetInnerHTML={{ __html: highLightKeyword(friend_username, keyword) }}
        />
      ) : (
        <div className="chat-friend-card__name">{friend_username}</div>
      )}
      {friend_id !== '0' && showDelete && (
        <Icon className="chat-friend-card__delete" component={DeleteFriend as any} onClick={handleDeleteFriend} />
      )}
    </div>
  );
}
