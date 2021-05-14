import React from 'react';
import { SearchMemberInfo } from '@/interface/chat/searchMember';
import { Avatar, Modal, message } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { useChat } from '../../state';
import { FriendListState } from '@/redux/reducers/state';
import { apiPost } from '@/utils/request';
import { AddFriendRequest } from '@/interface/chat/addFriend';
import { ADD_FRIEND } from '@/constants/urls';
import './index.less';

const { confirm } = Modal;

interface UserCardProps {
  userData: SearchMemberInfo;
  friendsList: FriendListState;
  getFriendsList(): void;
}

export function UserCard({ userData, friendsList, getFriendsList }: UserCardProps) {
  const { userInfo, online } = userData;
  const { setSelectUser } = useChat();

  // 添加好友
  async function handleAddFriend(friendId: string) {
    try {
      const reqData: AddFriendRequest = {
        friendId,
      };
      await apiPost(ADD_FRIEND, reqData);
      message.success(`您已成功添加${userInfo?.username || ''}为您的好友`);
      setSelectUser(userData); // 进入聊天界面
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
      setSelectUser(userData); // 进入聊天界面
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
