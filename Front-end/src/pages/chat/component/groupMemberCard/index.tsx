import React from 'react';
import { MemberInfo } from '@/interface/chat/newGroupChat';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { Avatar } from 'antd';
import './index.less';

interface GroupMemberCardProps {
  memberInfo: MemberInfo;
}

export function GroupMemberCard({ memberInfo }: GroupMemberCardProps) {
  const { member_avatar, member_username } = memberInfo;

  return (
    <div className="group-member-card">
      <Avatar className="group-member-card-avatar" src={member_avatar || defaultAvatar} />
      <div className="group-member-card-name">{member_username}</div>
    </div>
  );
}
