import { Avatar } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import React from 'react';
import './index.less';

interface MemberProps {
  name: string;
  avatar: string | null;
}

export function Member(props: MemberProps) {
  const { avatar, name } = props;

  return (
    <div className="role-member">
      <Avatar className="role-member__avatar" size={20} src={avatar || defaultAvatar} />
      <div className="role-member__name">{name}</div>
    </div>
  );
}
