import React, { MouseEvent, TouchEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { imgData, ImgViewerProviderBase, ShowAnimateEnum } from '../../types';
import { SlideWrap } from './slide-wrap';
import classnames from 'classnames';
import Close from '../../assets/close.svg';
import { AnimationHandler } from './animation-handler';
import { ImgViewerPreview } from '../img-viewer-preview';
import { DEBOUNCE_TIMEOUT, MAX_ZOOM_RATE, MIN_ZOOM_RATE, ZOOM_RATE } from '../../constant';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { debounce } from 'lodash-es';
import { getViewportSize } from '../../utils/get-viewport-size';
import './index.less';

export interface ImgViewerSliderProps extends ImgViewerProviderBase {
  images: imgData[]; // 图片列表
  visible: boolean; // 可见
  onClose: (e?: MouseEvent | TouchEvent) => void; // 关闭事件
  index?: number; // 图片当前索引
  onIndexChange?: (index: number) => void; // 索引改变回调
}

export interface ImgParams {
  naturalWidth: number; // 真实宽度
  naturalHeight: number; // 真实高度
  width: number; // 展示宽度
  height: number; // 展示高度
  loaded: boolean; // 加载成功状态
  broken: boolean; // 加载失败状态
}

export interface TransformInfo {
  offsetX: number; // x轴的偏移量
  offsetY: number; // y轴的偏移量
  scale: number; // 缩放比例
  rotate: number; // 旋转角度
  transition: string; // 动画
}

export function ImgViewerSlider({
  images,
  visible,
  index = 0,
  maskClosable = true,
  imgClosable = true,
  onClose,
  onIndexChange,
  onScaleChange,
  onRotateChange,
  container, // 挂载容器
  className, // 容器类名
  maskClassName, // 蒙层类名
  imageClassName, // 图片类名
}: ImgViewerSliderProps) {
  const [imgParams, setImgParams] = useState<ImgParams>({
    naturalWidth: 1,
    naturalHeight: 1,
    width: 1,
    height: 1,
    loaded: false,
    broken: false,
  });
  const [transformInfo, setTransformInfo] = useState<TransformInfo>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotate: 0,
    transition: 'all 0.2s ease-in-out',
  });
  const [imgIndex, setImgIndex] = useState(index); // 图片索引

  const totalLength = useMemo(() => images.length, [images]);

  // 更新图片宽高相关信息
  const updateImgParams = useCallback((params: Partial<ImgParams>) => {
    setImgParams((prev) => ({ ...prev, ...params }));
  }, []);

  // 更新图片变换相关信息
  const updateTransformInfo = useCallback((params: Partial<TransformInfo>) => {
    setTransformInfo((prev) => ({ ...prev, ...params }));
  }, []);

  const debounceOpenTransition = useMemo(
    () => debounce(() => updateTransformInfo({ transition: 'all 0.2s ease-in-out' }), DEBOUNCE_TIMEOUT),
    [updateTransformInfo],
  );

  // 更新style
  const updateTransformStyle = useCallback(
    (debounceTransition = false, transformParams?: Partial<TransformInfo>) => {
      if (debounceTransition) {
        debounceOpenTransition();
      }

      updateTransformInfo({
        ...transformParams,
        transition: 'none',
      });
    },
    [debounceOpenTransition, updateTransformInfo],
  );

  // 点击下一张
  const handleNextImg = useCallback(() => {
    if (imgIndex === totalLength - 1) {
      setImgIndex(0);
    }

    setImgIndex((prev) => prev + 1);
  }, [imgIndex, totalLength]);

  // 点击上一张
  const handlePrevImg = useCallback(() => {
    if (imgIndex === 0) {
      setImgIndex(totalLength - 1);
    }

    setImgIndex((prev) => prev - 1);
  }, [imgIndex, totalLength]);

  // 点击蒙层
  function handleMaskTap() {
    maskClosable && onClose();
  }

  // 点击图片
  const handleImgTap = useCallback(() => {
    if (imgClosable) {
      onClose();
    }
  }, [imgClosable, onClose]);

  // 点击旋转
  const handleRotate = useCallback(
    (rotate?: number) => {
      if (!isNullOrUndefined(rotate)) {
        setTransformInfo((prev) => ({
          ...prev,
          rotate,
        }));

        onRotateChange?.(rotate);
        return;
      }

      setTransformInfo((prev) => {
        const { rotate: prevRotate } = prev;
        let rotate = prevRotate;

        if (prevRotate >= 270) {
          rotate = 0;
        } else {
          rotate += 90;
        }

        onRotateChange?.(rotate);

        return {
          ...prev,
          rotate,
        };
      });
    },
    [onRotateChange],
  );

  // 缩放时动态调整偏移量
  const adjustOffsetPositionByScale = useCallback(
    (scale: number) => {
      const { naturalWidth, naturalHeight } = imgParams;
      const { width: viewportWidth, height: viewportHeight } = getViewportSize(container);
      const width = naturalWidth * scale;
      const height = naturalHeight * scale;

      setTransformInfo(({ offsetX, offsetY, ...restParams }) => {
        let newOffsetX = offsetX,
          newOffsetY = offsetY;

        if (offsetX !== 0) {
          if (width > viewportWidth) {
            const maxOffsetX = (width - viewportWidth) / 2;
            if (maxOffsetX < Math.abs(offsetX)) {
              newOffsetX = offsetX > 0 ? maxOffsetX : -maxOffsetX;
            }
          }

          if (width < viewportWidth) {
            newOffsetX = 0;
          }
        }

        if (offsetY !== 0) {
          if (height > viewportHeight) {
            const maxOffsetY = (height - viewportHeight) / 2;
            if (maxOffsetY < Math.abs(offsetY)) {
              newOffsetY = offsetY > 0 ? maxOffsetY : -maxOffsetY;
            }

            if (width < viewportHeight) {
              newOffsetY = 0;
            }
          }
        }

        return {
          ...restParams,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        };
      });
    },
    [container, imgParams],
  );

  // 缩放到指定比例
  const zoomTo = useCallback(
    (scale: number, forbiddenTransition = false) => {
      setTransformInfo((prev) => ({
        ...prev,
        scale,
      }));

      onScaleChange?.(scale);

      updateTransformStyle(forbiddenTransition);
    },
    [onScaleChange, updateTransformStyle],
  );

  // 缩放固定比例或指定比例
  const handleZoom = useCallback(
    (ratio = ZOOM_RATE, isZoomIn = false, forbiddenTransition = false) => {
      const { scale } = transformInfo;
      let zoom: number;
      if (isZoomIn) {
        // 放大
        zoom = Math.min(scale * (1 + ratio), MAX_ZOOM_RATE);
      } else {
        // 缩小
        zoom = Math.max(scale / (1 + ratio), MIN_ZOOM_RATE);
        adjustOffsetPositionByScale(zoom);
      }

      zoomTo(zoom, forbiddenTransition);
    },
    [adjustOffsetPositionByScale, transformInfo, zoomTo],
  );

  useEffect(() => {
    // 图片索引改变，重置旋转角度、缩放比例和图片索引
    setTransformInfo((prev) => ({
      ...prev,
      scale: 1,
      rotate: 0,
    }));
    setImgIndex(index);
  }, [index]);

  return (
    <AnimationHandler visible={visible} currentImage={images.length ? images[imgIndex] : undefined}>
      {({ imgVisible, showAnimateType, originRect, onShowAnimateEnd }) => {
        return imgVisible ? (
          <SlideWrap
            className={className}
            role="dialog"
            id="img-viewer-slider"
            container={container}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={classnames('img-viewer-slider__mask', maskClassName, {
                'img-viewer-slider__mask--fadeIn': showAnimateType === ShowAnimateEnum.In,
                'img-viewer-slider__mask--fadeOut': showAnimateType === ShowAnimateEnum.Out,
              })}
              onAnimationEnd={onShowAnimateEnd}
              onClick={handleMaskTap}
            />
            <div className="img-viewer-slider__close-btn" onClick={onClose}>
              <Close />
            </div>
            <ImgViewerPreview
              src={images[imgIndex]?.src || ''}
              imgParams={imgParams}
              transformInfo={transformInfo}
              onImgTap={handleImgTap}
              updateImgParams={updateImgParams}
              updateTransformStyle={updateTransformStyle}
              intro={images[imgIndex]?.intro}
              className={imageClassName}
              container={container}
              showAnimateType={showAnimateType}
              originRect={originRect}
              handleZoom={handleZoom}
              handleScale={zoomTo}
              handleRotate={handleRotate}
            />
          </SlideWrap>
        ) : (
          <></>
        );
      }}
    </AnimationHandler>
  );
}
