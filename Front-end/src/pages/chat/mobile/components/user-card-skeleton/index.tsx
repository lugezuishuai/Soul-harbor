import React from 'react';
import { Skeleton } from '@/components/skeleton';
import classnames from 'classnames';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

export function UserCardSkeletonMobile() {
  return (
    <Skeleton className={classnames('row-flex', 'user-card-skeleton__mobile')}>
      <AvatarSkeleton className="user-card-skeleton__mobile-avatar" />
      <div className="user-card-skeleton__mobile-info">
        <Block className="user-card-skeleton__mobile-info__item" />
        <Block className="user-card-skeleton__mobile-info__item" />
      </div>
    </Skeleton>
  );
}
