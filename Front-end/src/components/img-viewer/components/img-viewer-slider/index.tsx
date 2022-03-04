import React, { MouseEvent, TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { imgData, ImgViewerProviderBase, ShowAnimateEnum } from '../../types';
import { SlideWrap } from './slide-wrap';
import classnames from 'classnames';
import Close from '../../assets/close.svg';
import { AnimationHandler } from './animation-handler';
import {
  DEBOUNCE_TIMEOUT,
  KeyCode,
  LONG_PRESS_TO_DRAG_TIMEOUT,
  MAX_ZOOM_RATE,
  MIN_ZOOM_RATE,
  THROTTLE_SCROLL_TIMEOUT,
  WHEEL_SCROLL_SPEED_FACTOR,
  ZOOM_RATE,
} from '../../constant';
import { debounce, throttle } from 'lodash-es';
import { getViewportSize } from '../../utils/get-viewport-size';
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
import { filterEvent } from '../../utils/filter-event';
import './index.less';

interface Position {
  x: number;
  y: number;
}

interface OffsetPosition {
  offsetX: number;
  offsetY: number;
}

export enum ImgClass {
  GRAB = 'grab',
  GRABBING = 'grabbing',
  ZOOM_OUT = 'zoom_out',
}

export interface ImgViewerSliderProps extends ImgViewerProviderBase {
  images: imgData[]; // 图片列表
  visible: boolean; // 可见
  onClose: (e?: MouseEvent | TouchEvent) => void; // 关闭事件
  index: number; // 图片当前索引
  onIndexChange: (index: number) => void; // 索引改变回调
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
  index,
  maskClosable = true,
  imgClosable = true,
  toolbarRender,
  onClose,
  onIndexChange,
  onScaleChange,
  onRotateChange,
  container,
  className,
  maskClassName,
  imageClassName,
  loadingElement,
  brokenElement,
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
  const [showToolBar, setShowToolBar] = useState(true); // 是否显示工具栏
  const [imgMoveClass, setImgMoveClass] = useState<ImgClass>(ImgClass.ZOOM_OUT); // 图片移动className
  const [isOriginSize, setIsOriginSize] = useState(false); // 图片是否是原始大小
  const position = useRef<Position>({
    x: 0,
    y: 0,
  }); // 鼠标位置信息
  const drag = useRef(false); // 是否拖拽
  const timer = useRef<number | null>(null); // 定时器，用作判断是否是拖拽

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
    if (index >= totalLength - 1) {
      return;
    }

    onIndexChange(index + 1);
  }, [index, onIndexChange, totalLength]);

  // 点击上一张
  const handlePrev = useCallback(() => {
    if (index <= 0) {
      return;
    }

    onIndexChange(index - 1);
  }, [index, onIndexChange]);

  // 点击旋转(需要重置偏移量)
  const handleRotate = useCallback(
    (params?: number) => {
      setTransformInfo((prev) => {
        let rotate: number;
        if (params) {
          rotate = params;
        } else {
          const { rotate: prevRotate } = prev;
          rotate = prevRotate - 90;
        }
        onRotateChange?.(rotate);

        return {
          ...prev,
          offsetX: 0,
          offsetY: 0,
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
    (scale: number, forbiddenTransition = false, extraParams?: Partial<TransformInfo>) => {
      const params: Partial<TransformInfo> = {
        ...extraParams,
        scale,
      };

      onScaleChange?.(scale);

      const { width, height } = getViewportSize(container);
      const { naturalWidth, naturalHeight } = imgParams;
      if (naturalHeight * scale > height || naturalWidth * scale > width) {
        setImgMoveClass(ImgClass.GRAB);
      } else {
        setImgMoveClass(ImgClass.ZOOM_OUT);
      }

      updateTransformStyle(forbiddenTransition, params);
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
    ({ offsetX, offsetY }: OffsetPosition = { offsetX: 0, offsetY: 0 }) => {
      const imageDom = imgRef.current;
      if (!imageDom) {
        return;
      }

      const { width: viewportWidth, height: viewportHeight } = getViewportSize(container); // 视口宽高
      const { width, height } = imageDom.getBoundingClientRect(); // 图片宽高
      const { offsetX: prevOffsetX, offsetY: prevOffsetY } = transformInfo;
      let newOffsetX = prevOffsetX,
        newOffsetY = prevOffsetY;

      const xMovable = width > viewportWidth; // x轴可移动
      const yMovable = height > viewportHeight; // y轴可移动
      if (xMovable) {
        const maxOffsetX = (width - viewportWidth) / 2; // x轴最大偏移量
        const currentOffsetX = prevOffsetX + offsetX; // 当前x轴偏移量

        if (offsetX > 0) {
          newOffsetX = Math.min(maxOffsetX, currentOffsetX);
        }

        if (offsetX < 0) {
          newOffsetX = Math.max(-maxOffsetX, currentOffsetX);
        }
      }

      if (yMovable) {
        const maxOffsetY = (height - viewportHeight) / 2; // y轴最大偏移量
        const currentOffsetY = prevOffsetY + offsetY; // 当前y轴偏移量

        if (offsetY > 0) {
          newOffsetY = Math.min(maxOffsetY, currentOffsetY);
        }

        if (offsetY < 0) {
          newOffsetY = Math.max(-maxOffsetY, currentOffsetY);
        }
      }

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
      e.preventDefault();
      e.stopPropagation();
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

  // 鼠标离开回调
  const handleMouseLeave = useCallback(() => {
    if (timer.current) {
      // 清除定时器
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (drag.current) {
      drag.current = false;
    }
  }, []);

  // 鼠标点击回调
  const handleMouseDown = useCallback((e: MouseEvent) => {
    timer.current = window.setTimeout(() => {
      drag.current = true;
    }, LONG_PRESS_TO_DRAG_TIMEOUT);
    const { clientX, clientY } = e;
    position.current = {
      x: clientX,
      y: clientY,
    };
  }, []);

  // 鼠标移动回调
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drag.current) {
        return;
      }

      setImgMoveClass(ImgClass.GRABBING);
      const { clientX, clientY } = e;
      const { x, y } = position.current;
      const offsetX = clientX - x;
      const offsetY = clientY - y;
      handleImageMove({ offsetX, offsetY });

      position.current = {
        x: clientX,
        y: clientY,
      };
    },
    [handleImageMove],
  );

  // 鼠标抬起回调
  const handleMouseUp = useCallback(() => {
    if (timer.current) {
      // 清除定时器
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (drag.current) {
      // mouseup 先于 click 事件，setTimeout 的目的是在 click 逻辑执行完成后再更新 isDragging 的值
      setTimeout(() => {
        setImgMoveClass(ImgClass.GRAB);
        position.current = {
          x: 0,
          y: 0,
        };
        drag.current = false;
      }, 0);
    }
  }, []);

  // 拖拽事件
  const handleDragStart = useCallback((e) => {
    if ((e.target as Element)?.tagName.toLowerCase() === 'img') {
      e.preventDefault();
    }
  }, []);

  // 点击图片
  const handleImgTap = useCallback(() => {
    if (!drag.current && imgClosable) {
      onClose();
    }
  }, [imgClosable, onClose]);

  // 点击蒙层
  const handleMaskTap = useCallback(() => {
    if (!drag.current && maskClosable) {
      onClose();
    }
  }, [maskClosable, onClose]);

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
        zoomTo(Math.min(scale, calcMaxZoomRatio(naturalWidth, naturalHeight, rotate, container)), false, {
          offsetX: 0,
          offsetY: 0,
          rotate: 0,
        });
      }

      updateImgParams(params);
    },
    [container, transformInfo, updateImgParams, zoomTo],
  );

  // 重置offset
  const resetOffset = useCallback(() => {
    updateTransformInfo({
      offsetX: 0,
      offsetY: 0,
    });
  }, [updateTransformInfo]);

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

  // 键盘点击事件
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();
      const keyCode = e.keyCode || e.which || e.charCode;
      const { naturalHeight, naturalWidth } = imgParams;
      const { scale, rotate } = transformInfo;

      console.log('keyCode', keyCode);
      switch (keyCode) {
        case KeyCode.Escape: // 关闭
          e.preventDefault();
          onClose();
          break;
        case KeyCode.ArrowLeft: // 上一张
          handlePrev();
          break;
        case KeyCode.ArrowUp: // 放大
          e.preventDefault();
          handleZoom(undefined, true);
          break;
        case KeyCode.ArrowRight: // 下一张
          handleNext();
          break;
        case KeyCode.ArrowDown: // 缩小
          e.preventDefault();
          handleZoom();
          break;
        case KeyCode.F: // 还原原始比例
          if (e.ctrlKey && e.metaKey) {
            e.preventDefault();
            zoomTo(1);
          }
          break;
        case KeyCode.S: // 下载图片
          // 没有下载入口
          break;
        case KeyCode.R: // 旋转
          if (!isCtrlOrCommandPressed(e)) {
            e.preventDefault();
            handleRotate();
          }
          break;
        case KeyCode.Plus:
        case KeyCode.Add: // 放大
          if (isCtrlOrCommandPressed(e)) {
            e.preventDefault();
            handleZoom(undefined, true);
          }
          break;
        case KeyCode.Minus:
        case KeyCode.Subtract: // 缩小
          if (isCtrlOrCommandPressed(e)) {
            e.preventDefault();
            handleZoom();
          }
          break;
        case KeyCode.Space: // 适应页面
          zoomTo(Math.min(scale, calcMaxZoomRatio(naturalWidth, naturalHeight, rotate, container)));
          break;
        case KeyCode.Zero:
        case KeyCode.One:
        case KeyCode.Numpad_0:
        case KeyCode.Numpad_1: // 切换模式
          if (isCtrlOrCommandPressed(e)) {
            e.preventDefault();
            switchMode();
          }
          break;
        default:
          break;
      }
    },
    [
      container,
      handleNext,
      handlePrev,
      handleRotate,
      handleZoom,
      imgParams,
      onClose,
      switchMode,
      transformInfo,
      zoomTo,
    ],
  );

  const toolList = useMemo<ToolbarItem[]>(() => {
    const { scale } = transformInfo;
    const prevDisabled = index === 0,
      nextDisabled = index === totalLength - 1,
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
        content: `${index + 1}/${totalLength}`,
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
  }, [handleNext, handlePrev, handleRotate, index, isOriginSize, switchMode, totalLength, transformInfo, triggerZoom]);

  useEffect(() => {
    const slideWrap = ref.current;
    if (!slideWrap) {
      return;
    }

    window.addEventListener('resize', resizeDebounce);
    document.documentElement.addEventListener('keydown', handleKeydown, { capture: true });
    document.documentElement.addEventListener('keyup', filterEvent, { capture: true });
    document.documentElement.addEventListener('keypress', filterEvent, { capture: true });
    slideWrap.addEventListener('wheel', handleWheel);
    slideWrap.addEventListener('dragstart', handleDragStart);
    slideWrap.addEventListener('mousedown', handleMouseDown as any as EventListener);
    slideWrap.addEventListener('mousemove', handleMouseMove as any as EventListener);
    slideWrap.addEventListener('mouseup', handleMouseUp);
    slideWrap.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resizeDebounce);
      document.documentElement.removeEventListener('keydown', handleKeydown, { capture: true });
      document.documentElement.removeEventListener('keyup', filterEvent, { capture: true });
      document.documentElement.removeEventListener('keypress', filterEvent, { capture: true });
      slideWrap.removeEventListener('wheel', handleWheel);
      slideWrap.removeEventListener('dragstart', handleDragStart);
      slideWrap.removeEventListener('mousedown', handleMouseDown as any as EventListener);
      slideWrap.removeEventListener('mousemove', handleMouseMove as any as EventListener);
      slideWrap.removeEventListener('mouseup', handleMouseUp);
      slideWrap.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [
    handleDragStart,
    handleKeydown,
    handleMouseDown,
    handleMouseLeave,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resizeDebounce,
  ]);

  return (
    <AnimationHandler visible={visible} currentImage={images.length ? images[index] : undefined}>
      {({ imgVisible, showAnimateType, originRect, onShowAnimateEnd }) => {
        return imgVisible ? (
          <SlideWrap
            ref={ref as any}
            className={className}
            role="dialog"
            id="img-viewer-slider"
            container={container}
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
            {toolbarRender?.({
              images,
              index,
              visible: showToolBar,
              scale: transformInfo.scale,
              rotate: transformInfo.rotate,
              handlePrev,
              handleNext,
              handleZoom,
              switchMode,
              handleRotate,
            }) || <ImgViewerToolbar showToolbar={showToolBar} items={toolList} />}
            <ImgViewerPreview
              ref={imgRef as any}
              src={images[index]?.src || ''}
              intro={images[index]?.intro}
              className={imageClassName}
              imgMoveClass={imgMoveClass}
              imgParams={imgParams}
              transformInfo={transformInfo}
              onClick={handleImgTap}
              onImageLoaded={onImageLoaded}
              showAnimateType={showAnimateType}
              updateImgParams={updateImgParams}
              updateTransformInfo={updateTransformInfo}
              loadingElement={loadingElement}
              brokenElement={brokenElement}
            />
          </SlideWrap>
        ) : (
          <></>
        );
      }}
    </AnimationHandler>
  );
}
