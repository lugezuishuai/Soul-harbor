import React from 'react';
import Broken from '../../assets/broken.svg';
import { ShowAnimateEnum } from '../../types';
import classnames from 'classnames';
import './index.less';

interface ImgViewerBrokenProps {
  showAnimateType?: ShowAnimateEnum; // 动画类型
}

export function ImgViewerBroken({ showAnimateType }: ImgViewerBrokenProps) {
  return (
    <div
      className={classnames('img-viewer-broken', {
        'img-viewer-broken--fadeIn': showAnimateType === ShowAnimateEnum.In,
        'img-viewer-broken--fadeOut': showAnimateType === ShowAnimateEnum.Out,
      })}
    >
      <Broken />
    </div>
  );
}
