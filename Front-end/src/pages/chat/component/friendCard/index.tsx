import React from 'react';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import { Avatar, Icon, Modal } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { SelectSession, SelectSessionState } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import robotAvatar from '@/assets/image/robot.png';
import DeleteFriend from '@/assets/icon/delete_friend.svg';
import { screen } from '@/constants/screen';
import { useHistory } from 'react-router-dom';
import { highlightKeyword } from '@/utils/highlightKeyword';
import './index.less';

const { confirm } = Modal;
const { isMobile } = screen;

interface FriendCardProps {
  handleShowDrawer?(friendInfo: FriendInfo): void;
  deleteFriend?(id: string): Promise<void>;
  dispatch(action: Action): void;
  friendInfo: FriendInfo;
  showDelete?: boolean;
  keyword?: string;
  selectSession: SelectSessionState;
}

export function FriendCard({
  friendInfo,
  dispatch,
  handleShowDrawer,
  deleteFriend,
  selectSession,
  showDelete = true,
  keyword = '',
}: FriendCardProps) {
  const history = useHistory();
  const { friend_avatar, friend_id, friend_username } = friendInfo;

  function handleClick() {
    if (selectSession) {
      const { sessionId } = selectSession;

      if (friend_id === sessionId) {
        isMobile && history.push(`/chat/conversation/${sessionId}`);
        return;
      }
    }

    const newSelectSession: SelectSession = {
      type: 'private',
      sessionId: friend_id,
      name: friend_username,
    };

    dispatch({
      type: SELECT_SESSION,
      payload: newSelectSession,
    });
    isMobile && history.push(`/chat/conversation/${newSelectSession.sessionId}`);
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

  return (
    <div className="chat-friend-card" onClick={handleClick}>
      <Avatar
        className="chat-friend-card__avatar"
        src={friend_id !== '0' ? friend_avatar || defaultAvatar : robotAvatar}
      />
      <div className="chat-friend-card__name">{highlightKeyword(friend_username, keyword)}</div>
      {friend_id !== '0' && showDelete && (
        <Icon className="chat-friend-card__delete" component={DeleteFriend as any} onClick={handleDeleteFriend} />
      )}
    </div>
  );
}
