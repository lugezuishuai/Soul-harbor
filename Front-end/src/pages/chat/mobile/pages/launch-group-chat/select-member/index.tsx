import React from 'react';
import { Icon } from 'antd';
import { FriendsListInfo } from '..';
import defaultAvatar from '@/assets/image/default-avatar.png';
import classnames from 'classnames';
import './index.less';

interface SelectMemberProps {
  friendInfo: FriendsListInfo;
  handleDeleteOrSelect(id: string): void;
}

export function SelectMember({ friendInfo: showFriendInfo, handleDeleteOrSelect }: SelectMemberProps) {
  const { selected, friend_avatar, friend_id, friend_username } = showFriendInfo;

  function handleClick() {
    handleDeleteOrSelect(friend_id);
  }

  return (
    <div
      className={classnames('select-member__mobile', { 'select-member__mobile--active': selected })}
      onClick={handleClick}
    >
      <div className="select-member__mobile__status">
        {selected && <Icon type="check" className="select-member__mobile__check" />}
      </div>
      <img src={friend_avatar || defaultAvatar} alt="" className="select-member__mobile__img" />
      <div className="select-member__mobile__username">{friend_username}</div>
    </div>
  );
}
