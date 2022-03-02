import React, { MouseEvent, TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { imgData, ImgViewerProviderBase, ShowAnimateEnum } from '../../types';
import { SlideWrap } from './slide-wrap';
import classnames from 'classnames';
import Close from '../../assets/close.svg';
import { AnimationHandler } from './animation-handler';
import {
  DEBOUNCE_TIMEOUT,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_RESIZE,
  EVENT_WHEEL,
  MAX_ZOOM_RATE,
  MIN_ZOOM_RATE,
  THROTTLE_SCROLL_TIMEOUT,
  WHEEL_SCROLL_SPEED_FACTOR,
  ZOOM_RATE,
} from '../../constant';
import { debounce, throttle } from 'lodash-es';
import { getViewportSize } from '../../utils/get-viewport-size';
import { ImageDragManager, OffsetPosition } from './image-drag-manager';
import { preventDefault } from '../../utils/prevent-default';
import { isCtrlOrCommandPressed } from '../../utils/is-ctrl-or-command-pressed';
import { getScrollEdgeStatus } from '../../utils/get-scroll-edge-status';
import { isMouseInContainer } from '../../utils/is-mouse-in-container';
import { getShouldNativeScroll } from '../../utils/get-should-native-scroll';
import { ImgViewerPreview } from '../img-viewer-preview';
import { ToolbarItem, ImgViewerToolbar } from '../img-viewer-toolbar';
import PrevSVG from '../../assets/prev.svg';
import NextSVG from '../../assets/next.svg';
import PrevDisabledSVG from '../../assets/prev-disabled.svg';
import NextDisabledSVG from '../../assets/next-disabled.svg';
import OriginalSizeSVG from '../../assets/original-size.svg';
import AdjustSizeSVG from '../../assets/adjust-size.svg';
import RotateSVG from '../../assets/rotate.svg';
import ZoomInSVG from '../../assets/zoom-in.svg';
import ZoomOutSVG from '../../assets/zoom-out.svg';
import { calcMaxZoomRatio } from '../../utils/calc-max-zoom-ratio';
import { calcBasicScale } from '../../utils/calc-basic-scale';
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
  const ref = useRef<HTMLDivElement>();
  const imgRef = useRef<HTMLImageElement>();
  const [imgParams, setImgParams] = useState<ImgParams>({
    naturalWidth: 1,
    naturalHeight: 1,
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
  const [showToolBar, setShowToolBar] = useState(true); // 是否显示工具栏
  const [imgMoveClass, setImgMoveClass] = useState(false); // 图片移动className
  const [isOriginSize, setIsOriginSize] = useState(false); // 图片是否是原始大小

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
      let params: Partial<TransformInfo> | undefined = transformParams;
      if (debounceTransition) {
        params = {
          ...params,
          transition: 'none',
        };
        debounceOpenTransition();
      }

      params && updateTransformInfo(params);
    },
    [debounceOpenTransition, updateTransformInfo],
  );

  // 点击下一张
  const handleNext = useCallback(() => {
    if (imgIndex >= totalLength - 1) {
      return;
    }

    setImgIndex((prev) => {
      const current = prev + 1;
      onIndexChange?.(current);
      return current;
    });
  }, [imgIndex, onIndexChange, totalLength]);

  // 点击上一张
  const handlePrev = useCallback(() => {
    if (imgIndex <= 0) {
      return;
    }

    setImgIndex((prev) => {
      const current = prev - 1;
      onIndexChange?.(current);
      return current;
    });
  }, [imgIndex, onIndexChange]);

  // 点击蒙层
  function handleMaskTap() {
    maskClosable && onClose();
  }

  // 点击图片
  const handleImgTap = useCallback(() => {
    imgClosable && onClose();
  }, [imgClosable, onClose]);

  // 点击旋转(需要重置偏移量)
  const handleRotate = useCallback(() => {
    setTransformInfo((prev) => {
      const { rotate: prevRotate } = prev;
      const rotate = prevRotate - 90;
      onRotateChange?.(rotate);

      return {
        ...prev,
        offsetX: 0,
        offsetY: 0,
        rotate,
      };
    });
  }, [onRotateChange]);

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

      const { width, height } = getViewportSize(container);
      const { naturalWidth, naturalHeight } = imgParams;
      if (naturalHeight * scale > height || naturalWidth * scale > width) {
        setImgMoveClass(true);
      } else {
        setImgMoveClass(false);
      }

      updateTransformStyle(forbiddenTransition);
    },
    [container, imgParams, onScaleChange, updateTransformStyle],
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

  // 触发缩放
  const triggerZoom = useCallback(
    (isZoomIn: boolean) => {
      return () => handleZoom(undefined, isZoomIn);
    },
    [handleZoom],
  );

  // 计算图片移动偏移量
  const handleImageMove = useCallback(
    ({ offsetX, offsetY }: OffsetPosition) => {
      const imageDom = imgRef.current;
      if (!imageDom) {
        return;
      }

      const { width: viewportWidth, height: viewportHeight } = getViewportSize(container);
      const { width, height, left, right, bottom, top } = imageDom.getBoundingClientRect() || {
        width: 0,
        height: 0,
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      };
      const { offsetX: prevOffsetX, offsetY: prevOffsetY } = transformInfo;
      let newOffsetX = prevOffsetX,
        newOffsetY = prevOffsetY;

      const xMovable = width > viewportWidth; // x轴可移动
      const yMovable = height > viewportHeight; // y轴可移动

      if (xMovable) {
        if (offsetX < 0) {
          if (right > viewportWidth) {
            offsetX = Math.max(viewportWidth - right, offsetX);
          } else {
            offsetX = 0;
          }
        } else if (offsetX > 0) {
          if (left < 0) {
            offsetX = Math.min(-left, offsetX);
          } else {
            offsetX = 0;
          }
        } else {
          offsetX = 0;
        }

        newOffsetX += offsetX;
      } else {
        if (prevOffsetX !== 0) {
          newOffsetX = offsetX = 0;
        }
      }

      if (yMovable) {
        if (offsetY < 0) {
          if (bottom > viewportHeight) {
            offsetY = Math.max(viewportHeight - bottom, offsetY);
          } else {
            offsetY = 0;
          }
        } else if (offsetY > 0) {
          if (top < 0) {
            offsetY = Math.min(-top, offsetY);
          } else {
            offsetY = 0;
          }
        } else {
          offsetY = 0;
        }

        newOffsetY += offsetY;
      } else {
        if (prevOffsetY !== 0) {
          newOffsetY = offsetY = 0;
        }
      }

      console.log('newOffset', newOffsetX, newOffsetY);
      updateTransformStyle(true, { offsetX: newOffsetX, offsetY: newOffsetY });
    },
    [container, transformInfo, updateTransformStyle],
  );

  // 实现图片滚动
  const handleImageScroll = useCallback(
    (e: WheelEvent) => {
      const { loaded } = imgParams;
      if (!loaded) {
        return;
      }

      const { deltaX, deltaY } = e;
      const offsetX = -deltaX * WHEEL_SCROLL_SPEED_FACTOR; // 图片横向偏移量
      const offsetY = -deltaY * WHEEL_SCROLL_SPEED_FACTOR; // 图片纵向偏移量

      handleImageMove({ offsetX, offsetY });
    },
    [handleImageMove, imgParams],
  );

  const scrollThrottle = useMemo(() => throttle(handleImageScroll, THROTTLE_SCROLL_TIMEOUT), [handleImageScroll]);

  // 滚轮实现放大缩小
  const handleScrollByWheel = useCallback(
    (e: WheelEvent) => {
      let { deltaY } = e;
      const { ctrlKey, deltaMode } = e;

      window.requestAnimationFrame(() => {
        if (deltaMode === 1) {
          deltaY *= 150;
        }

        const divisor = ctrlKey ? 100 : 200;
        const scaleDiff = deltaY / divisor;

        handleZoom(Math.abs(scaleDiff), scaleDiff < 0, true);
      });
    },
    [handleZoom],
  );

  // 滚轮事件回调
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      preventDefault(e);
      const { loaded } = imgParams;
      if (!loaded) {
        return;
      }

      const { deltaY, ctrlKey } = e;

      // 区分是缩放还是滚动
      if (isCtrlOrCommandPressed(e) || (String(deltaY).indexOf('.') > -1 && ctrlKey)) {
        // 缩放
        handleScrollByWheel(e);
      } else {
        // 滚动
        const imageDom = imgRef.current;
        const slideContainer = ref.current;
        if (!imageDom || !slideContainer) {
          return;
        }

        const scrollEdgeStatus = getScrollEdgeStatus(imageDom, slideContainer);
        const shouldInternalScroll =
          isMouseInContainer(e, slideContainer) && !getShouldNativeScroll(e, scrollEdgeStatus);

        if (shouldInternalScroll) {
          // 图片可以内部滚动
          scrollThrottle(e);
        }
      }
    },
    [imgParams, handleScrollByWheel, scrollThrottle],
  );

  const imageDragManager = useMemo(() => new ImageDragManager(handleImageMove), [handleImageMove]);

  // 点击图片回调
  const handlePointerDown = useCallback<EventListener>(
    (e) => {
      imageDragManager.pointerdown(e as PointerEvent);
    },
    [imageDragManager],
  );

  // 移动图片回调
  const handlePointerMove = useCallback<EventListener>(
    (e) => {
      imageDragManager.pointermove(e as PointerEvent);
    },
    [imageDragManager],
  );

  // 鼠标抬起回调
  const handlePointerUp = useCallback<EventListener>(() => {
    imageDragManager.pointerup();
  }, [imageDragManager]);

  // resize事件回调
  const handleResize = useCallback(() => {
    const { loaded, naturalWidth, naturalHeight } = imgParams;
    const { rotate, scale } = transformInfo;

    if (!loaded) {
      return;
    }

    zoomTo(Math.min(scale, calcMaxZoomRatio(naturalWidth, naturalHeight, rotate, container)));
  }, [container, imgParams, transformInfo, zoomTo]);

  const resizeDebounce = useMemo(() => debounce(handleResize, DEBOUNCE_TIMEOUT), [handleResize]);

  // 图片加载完成的回调
  const onImageLoaded = useCallback(
    (params: Partial<ImgParams>) => {
      const { naturalWidth, naturalHeight } = params;
      const { rotate, scale } = transformInfo;

      if (naturalWidth && naturalHeight) {
        zoomTo(Math.min(scale, calcMaxZoomRatio(naturalWidth, naturalHeight, rotate, container)));
      }

      updateImgParams(params);
    },
    [container, transformInfo, updateImgParams, zoomTo],
  );

  // 重置offset
  const resetOffset = useCallback(() => {
    setTransformInfo((prev) => ({
      ...prev,
      offsetX: 0,
      offsetY: 0,
    }));
  }, []);

  // 根据图片尺寸设置合适的初始缩放值
  const calcAppropriateScale = useCallback(() => {
    const { naturalWidth, naturalHeight } = imgParams;
    const { rotate } = transformInfo;
    return Math.min(calcMaxZoomRatio(naturalWidth, naturalHeight, rotate), calcBasicScale(naturalWidth, container));
  }, [container, imgParams, transformInfo]);

  // 切换模式：「原始比例」|「适应页面」
  const switchMode = useCallback(() => {
    resetOffset();
    if (isOriginSize) {
      zoomTo(1);
    } else {
      zoomTo(calcAppropriateScale());
    }

    setIsOriginSize((prev) => !prev);
  }, [calcAppropriateScale, isOriginSize, resetOffset, zoomTo]);

  const toolList = useMemo<ToolbarItem[]>(() => {
    const { scale } = transformInfo;
    const prevDisabled = imgIndex === 0,
      nextDisabled = imgIndex === totalLength - 1,
      zoomOutDisabled = scale <= MIN_ZOOM_RATE,
      zoomInDisabled = scale >= MAX_ZOOM_RATE;

    return [
      {
        key: 'prev',
        title: '上一张',
        onClick: handlePrev,
        disabled: prevDisabled,
        icon: prevDisabled ? <PrevDisabledSVG /> : <PrevSVG />,
        type: 'button',
      },
      {
        key: 'info',
        content: `${imgIndex + 1}/${totalLength}`,
        type: 'node',
      },
      {
        key: 'next',
        title: '下一张',
        onClick: handleNext,
        disabled: nextDisabled,
        icon: nextDisabled ? <NextDisabledSVG /> : <NextSVG />,
        type: 'button',
      },
      {
        key: 'divider-1',
        type: 'divider',
      },
      {
        key: 'zoomOut',
        title: '缩小',
        onClick: triggerZoom(false),
        disabled: zoomOutDisabled,
        icon: <ZoomOutSVG />,
        type: 'button',
      },
      {
        key: 'scaleInfo',
        content: `${Math.round(scale * 100)}%`,
        type: 'node',
      },
      {
        key: 'zoomIn',
        title: '放大',
        onClick: triggerZoom(true),
        disabled: zoomInDisabled,
        icon: <ZoomInSVG />,
        type: 'button',
      },
      {
        key: 'sizeChange',
        title: isOriginSize ? '适应页面' : '原始比例',
        onClick: switchMode,
        icon: isOriginSize ? <AdjustSizeSVG /> : <OriginalSizeSVG />,
        type: 'button',
      },
      {
        key: 'divider-2',
        type: 'divider',
      },
      {
        key: 'rotate',
        title: '旋转',
        onClick: handleRotate,
        icon: <RotateSVG />,
        type: 'button',
      },
    ];
  }, [
    handleNext,
    handlePrev,
    handleRotate,
    imgIndex,
    isOriginSize,
    switchMode,
    totalLength,
    transformInfo,
    triggerZoom,
  ]);

  useEffect(() => {
    // 图片索引改变，重置旋转角度、缩放比例、偏移量和图片索引
    setTransformInfo((prev) => ({
      ...prev,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      rotate: 0,
    }));
    setImgIndex(index);
  }, [index]);

  useEffect(() => {
    const slideWrap = ref.current;
    if (!slideWrap) {
      return;
    }

    window.addEventListener(EVENT_RESIZE, resizeDebounce);
    slideWrap.addEventListener(EVENT_WHEEL, handleWheel);
    slideWrap.addEventListener(EVENT_POINTER_DOWN, handlePointerDown);
    slideWrap.addEventListener(EVENT_POINTER_MOVE, handlePointerMove);
    slideWrap.addEventListener(EVENT_POINTER_UP, handlePointerUp);

    return () => {
      window.removeEventListener(EVENT_RESIZE, resizeDebounce);
      slideWrap.removeEventListener(EVENT_WHEEL, handleWheel);
      slideWrap.removeEventListener(EVENT_POINTER_DOWN, handlePointerDown);
      slideWrap.removeEventListener(EVENT_POINTER_MOVE, handlePointerMove);
      slideWrap.removeEventListener(EVENT_POINTER_UP, handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleWheel, resizeDebounce]);

  return (
    <AnimationHandler visible={visible} currentImage={images.length ? images[imgIndex] : undefined}>
      {({ imgVisible, showAnimateType, originRect, onShowAnimateEnd }) => {
        return imgVisible ? (
          <SlideWrap
            ref={ref as any}
            className={className}
            role="dialog"
            id="img-viewer-slider"
            container={container}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setShowToolBar(true)}
            onMouseLeave={() => setShowToolBar(false)}
          >
            <div
              className={classnames('img-viewer-slider__mask', maskClassName, {
                'img-viewer-slider__mask--fadeIn': showAnimateType === ShowAnimateEnum.In,
                'img-viewer-slider__mask--fadeOut': showAnimateType === ShowAnimateEnum.Out,
              })}
              onAnimationEnd={onShowAnimateEnd}
              onClick={handleMaskTap}
            />
            <div
              className={classnames('img-viewer-slider__close-btn', {
                'img-viewer-slider__close-btn--hidden': !showToolBar,
              })}
              onClick={onClose}
            >
              <Close />
            </div>
            <ImgViewerToolbar showToolbar={showToolBar} items={toolList} />
            <ImgViewerPreview
              ref={imgRef as any}
              src={images[imgIndex]?.src || ''}
              intro={images[imgIndex]?.intro}
              className={imageClassName}
              imgMoveClass={imgMoveClass}
              imgParams={imgParams}
              transformInfo={transformInfo}
              onClick={handleImgTap}
              onImageLoaded={onImageLoaded}
              showAnimateType={showAnimateType}
              updateTransformStyle={updateTransformStyle}
            />
          </SlideWrap>
        ) : (
          <></>
        );
      }}
    </AnimationHandler>
  );
}
