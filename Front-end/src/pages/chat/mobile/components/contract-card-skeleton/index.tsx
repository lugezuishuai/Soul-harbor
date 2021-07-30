import React from 'react';
import classnames from 'classnames';
import { Skeleton } from '@/components/skeleton';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

export function ContractCardSkeletonMobile() {
  return (
    <Skeleton className={classnames('row-flex', 'contract-card-skeleton__mobile')}>
      <AvatarSkeleton className="contract-card-skeleton__mobile__avatar" />
      <Block className="contract-card-skeleton__mobile__text" />
    </Skeleton>
  );
}
