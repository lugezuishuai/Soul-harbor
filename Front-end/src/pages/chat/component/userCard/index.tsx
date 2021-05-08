import React from 'react';
import { SearchMemberInfo } from '@/interface/chat/searchMember';
import { Avatar, Modal } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { useChat } from '../../state';
import './index.less';
const { confirm } = Modal;

interface UserCardProps {
  userData: SearchMemberInfo;
}

export function UserCard({ userData }: UserCardProps) {
  const { userInfo, online } = userData;
  const { handleSelectUser } = useChat();

  function handleClick() {
    const online = handleSelectUser(userInfo?.uid || '');
    if (!online) {
      confirm({
        title: '注意',
        content: '对不起，对方还未上线，不能发起聊天',
        centered: true,
        okText: '确认',
        cancelText: '取消',
      });
    }
  }

  return (
    <div className="chat-user-card" onClick={handleClick}>
      <div className="chat-user-card-online" style={{ backgroundColor: online ? '#1afa29' : '#BBBFC4' }} />
      <Avatar className="chat-user-card-avatar" src={userInfo?.avatar || defaultAvatar} />
      <div className="chat-user-card-info">
        <div className="chat-user-card-info-text">{userInfo?.username}</div>
        <div className="chat-user-card-info-text">{userInfo?.email}</div>
      </div>
    </div>
  );
}
