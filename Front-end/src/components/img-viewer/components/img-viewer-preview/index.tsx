import React, { CSSProperties, forwardRef, HTMLAttributes, memo, ReactNode, useEffect, useMemo } from 'react';
import { Spin } from 'antd';
import { brokenElementType, ShowAnimateEnum } from '../../types';
import { useMountedState } from '../../utils/use-mounted-state';
import classnames from 'classnames';
import { ImgViewerBroken } from '../img-viewer-broken';
import { ImgParams, TransformInfo } from '../img-viewer-slider';
import './index.less';

export interface ImgViewerPreviewProps extends HTMLAttributes<any> {
  src: string; // 图片url
  imgParams: ImgParams; // 图片宽高相关信息
  transformInfo: TransformInfo; // 图片变换相关信息
  imgMoveClass: boolean; // 图片移动的样式
  onImageLoaded: (params: Partial<ImgParams>) => void; // 图片加载完成回调
  updateTransformStyle: (debounceTransition?: boolean, transformParams?: Partial<TransformInfo>) => void; // 更新transition动画
  className?: string; // 图片类名
  intro?: ReactNode; // 图片介绍
  loadingElement?: JSX.Element; // 加载中组件
  brokenElement?: brokenElementType; // 加载失败组件
  showAnimateType?: ShowAnimateEnum; // 动画类型
}

export const ImgViewerPreview = memo(
  forwardRef<HTMLImageElement, ImgViewerPreviewProps>((props, ref) => {
    const {
      src,
      imgParams,
      transformInfo,
      imgMoveClass,
      onImageLoaded,
      updateTransformStyle,
      className,
      intro,
      loadingElement,
      brokenElement,
      showAnimateType,
      ...restProps
    } = props;

    // 图片样式
    const style = useMemo<CSSProperties>(() => {
      const { offsetX, offsetY, transition, rotate, scale } = transformInfo;

      let transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;

      if (offsetX || offsetY) {
        transform += ` translate(${offsetX}px, ${offsetY}px)`;
      }

      return {
        transform,
        transition,
      };
    }, [transformInfo]);

    const isMounted = useMountedState();

    // 图片加载完成的回调
    function handleImageLoaded(e: Event) {
      const { naturalWidth, naturalHeight } = e.target as HTMLImageElement;
      if (isMounted()) {
        onImageLoaded({
          loaded: true,
          naturalWidth,
          naturalHeight,
        });
      }
    }

    // 图片加载失败的回调
    function handleImageBroken() {
      if (isMounted()) {
        onImageLoaded({
          broken: true,
        });
      }
    }

    // 图片src改变触发重新加载
    useEffect(() => {
      const currImg = new Image();
      currImg.onload = handleImageLoaded;
      currImg.onerror = handleImageBroken;
      currImg.src = src;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    useEffect(() => {
      if (showAnimateType === ShowAnimateEnum.Out) {
        // 退出动画，重置旋转角度、缩放比例和偏移量
        setTimeout(() => {
          updateTransformStyle(true, {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            rotate: 0,
          });
        }, 200);
      }
    }, [showAnimateType, updateTransformStyle]);

    const { broken, loaded, naturalHeight, naturalWidth } = imgParams;

    if (src && !broken) {
      if (loaded) {
        return (
          <img
            ref={ref}
            style={style}
            className={classnames(
              'img-viewer-preview',
              imgMoveClass ? 'img-viewer-preview--out' : 'img-viewer-preview--move',
              className,
              {
                'img-viewer-preview--fadeIn': loaded && showAnimateType === ShowAnimateEnum.In,
                'img-viewer-preview--fadeOut': loaded && showAnimateType === ShowAnimateEnum.Out,
              },
            )}
            src={src}
            width={naturalWidth}
            height={naturalHeight}
            alt=""
            {...restProps}
          />
        );
      }

      return loadingElement || <Spin className="img-viewer-preview__loading" size="large" />;
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
