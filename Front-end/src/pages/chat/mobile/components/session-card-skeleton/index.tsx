import { Skeleton } from '@/components/skeleton';
import React from 'react';
import classnames from 'classnames';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

interface SessionCardSkeletonMobileProps {
  key: string | number;
}

export function SessionCardSkeletonMobile({ key }: SessionCardSkeletonMobileProps) {
  return (
    <Skeleton key={key} className={classnames('row-flex', 'session-card-skeleton__mobile')}>
      <AvatarSkeleton className="session-card-skeleton__mobile-avatar" />
      <div className="session-card-skeleton__mobile-info">
        <div className="session-card-skeleton__mobile-info__top">
          <Block className="session-card-skeleton__mobile-info-name" />
          <Block className="session-card-skeleton__mobile-info-time" />
        </div>
        <Block className="session-card-skeleton__mobile-info-msg" />
      </div>
    </Skeleton>
  );
}
