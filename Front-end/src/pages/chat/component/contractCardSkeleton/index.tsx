import React from 'react';
import classnames from 'classnames';
import { Skeleton } from '@/components/custom-skeleton';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

export function ContractCardSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'contract-card-skeleton')}>
      <AvatarSkeleton className="contract-card-skeleton__avatar" />
      <Block className="contract-card-skeleton__text" />
    </Skeleton>
  );
}
