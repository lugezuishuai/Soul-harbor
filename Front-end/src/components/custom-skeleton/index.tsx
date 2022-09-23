import React, { CSSProperties, ReactNode } from 'react';
import classnames from 'classnames';
import './index.less';

export interface SkeletonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
export interface SkeletonChildProps {
  className?: string;
  style?: CSSProperties;
}

export interface SkeletonAvatarProps extends SkeletonChildProps {
  size?: number;
  borderRadius?: number;
}

export function Skeleton(props: SkeletonProps) {
  const { children, className, style } = props;
  return (
    <div className={classnames('skeleton', className)} style={style}>
      {children}
    </div>
  );
}

function getChildComponent(name: string) {
  return (props: SkeletonChildProps) => {
    const { className, style } = props;
    return <div className={classnames(`skeleton-${name}`, className)} style={style} />;
  };
}
Skeleton.Block = getChildComponent('block');
Skeleton.InlineBlock = getChildComponent('inline-block');
Skeleton.Image = getChildComponent('image');
Skeleton.Avatar = (props: SkeletonAvatarProps) => {
  const { size, borderRadius, className, style } = props;
  return (
    <div
      className={classnames('skeleton-avatar', className)}
      style={size ? 
        {
          width: size,
          height: size,
          borderRadius: borderRadius == null ? size / 6 : borderRadius,
          ...style,
        } : 
        {}
      }
    />
  );
};
