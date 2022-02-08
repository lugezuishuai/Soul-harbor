import React, { forwardRef, HTMLAttributes, memo, ReactNode, useEffect } from 'react';
import { Spin } from 'antd';
import { brokenElementType, ShowAnimateEnum } from '../../types';
import { useMountedState } from '../../utils/use-mounted-state';
import { getSuitableImgSize } from '../../utils/get-suitable-img-size';
import classnames from 'classnames';
import { ImgViewerBroken } from '../img-viewer-broken';
import { ImgParams } from '../img-viewer-slider';
import { getViewportSize } from '../../utils/get-viewport-size';
import './index.less';

export interface ImgViewerImgProps extends HTMLAttributes<any> {
  src: string; // 图片url
  loaded: boolean; // 图片是否已经加载
  broken: boolean; // 图片是否加载失败
  naturalWidth: number; // 图片原始宽度
  naturalHeight: number; // 图片原始高度
  rotate: number; // 图片旋转角度
  onImageLoad: (params: Partial<ImgParams>) => void; // 图片加载完成回调
  className?: string; // 图片类名
  intro?: ReactNode; // 图片介绍
  container?: HTMLElement; // 容器
  loadingElement?: JSX.Element; // 加载中组件
  brokenElement?: brokenElementType; // 加载失败组件
  showAnimateType?: ShowAnimateEnum; // 动画类型
}

export const ImgViewerImg = memo(
  forwardRef<HTMLImageElement, ImgViewerImgProps>((props, ref) => {
    const {
      src,
      loaded,
      broken,
      naturalWidth,
      naturalHeight,
      rotate,
      onImageLoad,
      className,
      intro,
      container,
      loadingElement,
      brokenElement,
      showAnimateType,
      ...restProps
    } = props;

    const isMounted = useMountedState();

    // 图片加载完成的回调
    function handleImageLoaded(e: Event) {
      const { naturalWidth, naturalHeight } = e.target as HTMLImageElement;
      if (isMounted()) {
        const { width: viewportWidth, height: viewportHeight } = getViewportSize(container);
        onImageLoad({
          loaded: true,
          naturalWidth,
          naturalHeight,
          ...getSuitableImgSize(naturalWidth, naturalHeight, rotate, viewportWidth, viewportHeight),
        });
      }
    }

    // 图片加载失败的回调
    function handleImageBroken() {
      if (isMounted()) {
        onImageLoad({
          broken: true,
        });
      }
    }

    useEffect(() => {
      const currImg = new Image();
      currImg.onload = handleImageLoaded;
      currImg.onerror = handleImageBroken;
      currImg.src = src;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (src && !broken) {
      if (loaded) {
        return (
          <img
            ref={ref}
            className={classnames('img-viewer-img', className, {
              'img-viewer-img--fadeIn': loaded && showAnimateType === ShowAnimateEnum.In,
              'img-viewer-img--fadeOut': loaded && showAnimateType === ShowAnimateEnum.Out,
            })}
            src={src}
            width={naturalWidth}
            height={naturalHeight}
            alt=""
            {...restProps}
          />
        );
      }

      return loadingElement || <Spin className="img-viewer-img__loading" size="large" />;
    }

    if (typeof brokenElement === 'function') {
      return brokenElement({
        src,
        intro,
      });
    }

    return brokenElement || <ImgViewerBroken showAnimateType={showAnimateType} />;
  }),
);
