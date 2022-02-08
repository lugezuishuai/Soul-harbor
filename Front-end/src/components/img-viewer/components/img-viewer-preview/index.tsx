import React, { CSSProperties, ReactNode, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { brokenElementDataType, handleImgTapFn, OriginRectType, ShowAnimateEnum } from '../../types';
import { ImgViewerImg } from '../img-viewer-img';
import { throttle } from 'lodash-es';
import { getSuitableImgSize } from '../../utils/get-suitable-img-size';
import { THROTTLE_SCROLL_TIMEOUT, WHEEL_SCROLL_SPEED_FACTOR } from '../../constant';
import { isCtrlOrCommandPressed } from '../../utils/is-ctrl-or-command-pressed';
import { getScrollEdgeStatus } from '../../utils/get-scroll-edge-status';
import { isMouseInContainer } from '../../utils/is-mouse-in-container';
import { getShouldNativeScroll } from '../../utils/get-should-native-scroll';
import { ImageDragManager, OffsetPosition } from './image-drag-manager';
import { ImgParams, TransformInfo } from '../img-viewer-slider';
import { getViewportSize } from '../../utils/get-viewport-size';
import './index.less';

export interface ImgViewerPreviewProps {
  src: string; // 图片url
  imgParams: ImgParams; // 图片宽高相关信息
  transformInfo: TransformInfo; // 图片变换相关信息
  onImgTap: handleImgTapFn; // 图片点击事件
  updateImgParams: (imgParams: Partial<ImgParams>) => void; // 更新图片宽高相关信息
  updateTransformStyle: (debounceTransition?: boolean, transformParams?: Partial<TransformInfo>) => void; // 更新transition动画
  intro?: ReactNode; // 图片介绍
  className?: string; // 图片类名
  style?: CSSProperties; // style
  container?: HTMLElement; // 容器
  loadingElement?: JSX.Element; // 自定义loading
  brokenElement?: JSX.Element | ((imgProps: brokenElementDataType) => JSX.Element); // 加载失败Element
  showAnimateType?: ShowAnimateEnum; // 动画类型
  originRect?: OriginRectType; // 动画源位置
  handleZoom?: (ratio?: number, isZoomIn?: boolean, forbiddenTransition?: boolean) => void; // 缩放固定比例或指定比例
  handleScale?: (scale: number, forbiddenTransition?: boolean) => void; // 改变缩放比例
  handleRotate?: (rotate?: number) => void; // 改变旋转角度
}

export const ImgViewerPreview = memo(
  ({
    src,
    imgParams,
    transformInfo,
    onImgTap,
    updateImgParams,
    updateTransformStyle,
    intro,
    className,
    style,
    container,
    loadingElement,
    brokenElement,
    showAnimateType,
    handleScale,
    handleZoom,
    handleRotate,
  }: ImgViewerPreviewProps) => {
    const ref = useRef<HTMLImageElement>();
    const offsetXRef = useRef(0);
    const offsetYRef = useRef(0);

    const imgStyle = useMemo<CSSProperties>(() => {
      const { width, naturalWidth } = imgParams;
      const { offsetX, offsetY, transition, rotate, scale } = transformInfo;

      let transform = `translate(-50%, -50%) scale(${(width / naturalWidth) * scale}) rotate(${rotate}deg)`;

      if (offsetX || offsetY) {
        transform += ` translate(${offsetX}px, ${offsetY}px)`;
      }

      return {
        transform,
        transition,
      };
    }, [imgParams, transformInfo]);

    const handleResize = useCallback(() => {
      const { loaded, naturalHeight, naturalWidth } = imgParams;
      const { rotate } = transformInfo;
      const { width: viewportWidth, height: viewportHeight } = getViewportSize(container);
      if (loaded) {
        updateImgParams(getSuitableImgSize(naturalWidth, naturalHeight, rotate, viewportWidth, viewportHeight));
      }
    }, [container, imgParams, transformInfo, updateImgParams]);

    // 计算图片移动偏移量
    const handleImageMove = useCallback(
      ({ offsetX, offsetY }: OffsetPosition) => {
        const imageDom = ref.current;
        if (!imageDom) {
          return;
        }

        const { width: viewportWidth, height: viewportHeight } = getViewportSize(container);
        const { width, height, left, right, bottom, top } = imageDom.getBoundingClientRect();
        const prevOffsetX = offsetXRef.current;
        const prevOffsetY = offsetYRef.current;

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

          offsetXRef.current = prevOffsetX + offsetX;
        } else {
          if (prevOffsetX !== 0) {
            offsetXRef.current = offsetX = 0;
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

          offsetYRef.current = prevOffsetY + offsetY;
        } else {
          if (prevOffsetY !== 0) {
            offsetYRef.current = offsetY = 0;
          }
        }

        updateTransformStyle(true, { offsetX: offsetXRef.current, offsetY: offsetYRef.current });
      },
      [container, updateTransformStyle],
    );

    const imageDragManager = useMemo(() => new ImageDragManager(handleImageMove), [handleImageMove]);

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

    // 滚轮实现放大缩小
    const onWheel = useCallback(
      (e: WheelEvent) => {
        let { deltaY } = e;
        const { ctrlKey, deltaMode } = e;

        window.requestAnimationFrame(() => {
          if (deltaMode === 1) {
            deltaY *= 150;
          }

          const divisor = ctrlKey ? 100 : 200;
          const scaleDiff = deltaY / divisor;

          handleZoom?.(Math.abs(scaleDiff), scaleDiff < 0, true);
        });
      },
      [handleZoom],
    );

    // 滚动放大缩小
    const handleWheel = useCallback(
      (e: WheelEvent) => {
        const { loaded } = imgParams;
        if (!loaded) {
          return;
        }

        const { deltaY, ctrlKey } = e;

        // 区分是缩放还是滚动
        if (isCtrlOrCommandPressed(e) || (String(deltaY).indexOf('.') > -1 && ctrlKey)) {
          // 缩放
          onWheel(e);
        } else {
          // 滚动
          const imageDom = ref.current;
          if (!imageDom) {
            return;
          }

          const container = imageDom.parentElement;
          if (!container) {
            return;
          }

          const scrollEdgeStatus = getScrollEdgeStatus(imageDom, container);
          const shouldInternalScroll = isMouseInContainer(e, container) && !getShouldNativeScroll(e, scrollEdgeStatus);

          if (shouldInternalScroll) {
            // 图片可以内部滚动
            // e.preventDefault();
            // e.stopPropagation();

            throttle(handleImageScroll, THROTTLE_SCROLL_TIMEOUT)(e);
          }
        }
      },
      [imgParams, onWheel, handleImageScroll],
    );

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

    useEffect(() => {
      const wrapHandleResize = throttle(handleResize, THROTTLE_SCROLL_TIMEOUT);
      const wrapContainer = container || window;
      wrapContainer.addEventListener('resize', wrapHandleResize);
      wrapContainer.addEventListener('mousedown', handlePointerDown);
      wrapContainer.addEventListener('mousemove', handlePointerMove);
      wrapContainer.addEventListener('mouseup', handlePointerUp);

      return () => {
        wrapContainer.removeEventListener('resize', wrapHandleResize);
        wrapContainer.removeEventListener('mousedown', handlePointerDown);
        wrapContainer.removeEventListener('mousemove', handlePointerMove);
        wrapContainer.removeEventListener('mouseup', handlePointerUp);
      };
    }, [container, handlePointerDown, handlePointerMove, handlePointerUp, handleResize]);

    useEffect(() => {
      if (showAnimateType === ShowAnimateEnum.Out) {
        // 重置scale和rotate
        handleScale?.(1, true);
        handleRotate?.(0);
      }
    }, [handleRotate, handleScale, showAnimateType]);

    return (
      <ImgViewerImg
        src={src}
        className={className}
        intro={intro}
        loaded={imgParams.loaded}
        broken={imgParams.broken}
        naturalWidth={imgParams.naturalWidth}
        naturalHeight={imgParams.naturalHeight}
        container={container}
        loadingElement={loadingElement}
        brokenElement={brokenElement}
        rotate={transformInfo.rotate}
        onImageLoad={updateImgParams}
        onWheel={handleWheel as any}
        onClick={onImgTap}
        showAnimateType={showAnimateType}
        style={{ ...imgStyle, ...style }}
        ref={ref as any}
      />
    );
  },
);
