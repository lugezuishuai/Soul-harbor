import React from 'react';
import { Icon } from 'antd';
import Selected from '@/assets/icon/selected.svg';
import { FriendsListInfo } from '..';
import defaultAvatar from '@/assets/image/default-avatar.png';
import classnames from 'classnames';
import { Skeleton } from '@/components/skeleton';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

interface SelectMemberProps {
  friendInfo: FriendsListInfo;
  handleDeleteOrSelect(id: string): void;
}

export function SelectMemberSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'select-member__mobile-skeleton')}>
      <AvatarSkeleton className="select-member__mobile-skeleton__status" />
      <AvatarSkeleton className="select-member__mobile-skeleton__avatar" />
      <Block className="select-member__mobile-skeleton__username" />
    </Skeleton>
  );
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
      {selected ? (
        <Icon component={Selected as any} className="select-member__mobile__selected" />
      ) : (
        <div className="select-member__mobile__status" />
      )}
      <img src={friend_avatar || defaultAvatar} alt="" className="select-member__mobile__avatar" />
      <div className="select-member__mobile__username">{friend_username}</div>
    </div>
  );
}
