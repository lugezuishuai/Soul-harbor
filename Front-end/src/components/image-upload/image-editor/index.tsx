import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import ZoomIn from '../icon/zoom-in.r.svg';
import ZoomOut from '../icon/zoom-out.r.svg';
import { getImageInfo } from '@/utils/getImageInfo';
import { Icon } from 'antd';
import classnames from 'classnames';

import './index.less';

export interface RcRef {
  getImageDataURL(): string;
}

export interface ImageEditorProps {
  img: File | string;
  width: number;
  height: number;
  border?: string;
  minScale?: number;
  maxScale?: number;
  ratio?: number;
  opacity: number;
}

export interface ImageInfo {
  resource?: CanvasImageSource;
  newHeight: number;
  newWidth: number;
  x: number; // 记录canvas里面截取图片的中点坐标
  y: number;
  xyRatio: number; // 宽高比
  yxRatio: number; // 高宽比
  // 原始缩放比率
  xOriginalScale: number;
  yOriginalScale: number;
  // 鼠标点击的位置坐标
  mx: number;
  my: number;
}

function handleImageError(err: Error): any {
  console.error('[AvatarEditor] load image error: ', err);
}

export const ImageEditor = forwardRef<RcRef, ImageEditorProps>((props, ref) => {
  const {
    border,
    minScale = 1,
    maxScale = 2,
    img,
    ratio = 1,
    opacity,
    width: containerWidth,
    height: containerHeight,
  } = props;
  const width = props.width * ratio;
  const height = props.height * ratio;
  const [scale, setScale] = useState<number>(1); // 容器里面图片的缩放比例
  const [drag, setDrag] = useState<boolean>(false); // 鼠标拖拽的标志

  const imgState = useRef<ImageInfo>({
    // 图片的信息
    x: 0.5,
    y: 0.5,
    newHeight: height,
    newWidth: width,
    xyRatio: 1,
    yxRatio: 1,
    xOriginalScale: 1,
    yOriginalScale: 1,
    mx: 0,
    my: 0,
  });

  const canvasXYRatio = width / height;
  const canvasYXRatio = height / width;

  const canvas = useRef<HTMLCanvasElement>(null);

  const isZoomInDisabled = Math.abs(scale - maxScale) < 0.01;
  const isZoomOutDisabled = Math.abs(scale - minScale) < 0.01;

  /**
   * 返回图片的canvas左上角相对图片左上角的归一化坐标
   */
  function getCroppingRect() {
    const { xOriginalScale, yOriginalScale, x, y } = imgState.current;
    const XScale = xOriginalScale / scale;
    const YScale = yOriginalScale / scale;
    const croppingRectX = x - XScale / 2;
    const croppingRectY = y - YScale / 2;

    let xMin, xMax, yMin, yMax;
    if (XScale > 1 || YScale > 1) {
      // 如果图片其中一边大于canvas宽高
      xMin = -XScale;
      xMax = 1;
      yMin = -YScale;
      yMax = 1;
    } else {
      xMin = 0;
      xMax = 1 - XScale;
      yMin = 0;
      yMax = 1 - YScale;
    }

    return {
      x: Math.max(xMin, Math.min(croppingRectX, xMax)),
      y: Math.max(yMin, Math.min(croppingRectY, yMax)),
    };
  }

  function paintImage() {
    if (imgState.current.resource && canvas.current) {
      const context = canvas.current.getContext('2d');
      if (context) {
        const croppingRect = getCroppingRect();
        //  获取canvas左上角相对图片左上角的真实坐标（取反）与图片缩放后的宽高
        const x = -croppingRect.x * (imgState.current.newWidth * scale);
        const y = -croppingRect.y * (imgState.current.newHeight * scale);
        const widthS = imgState.current.newWidth * scale;
        const heightS = imgState.current.newHeight * scale;
        context.clearRect(0, 0, width, height);
        context.globalAlpha = opacity;
        context.drawImage(imgState.current.resource, x, y, widthS, heightS);
      }
    }
  }

  /**
   * 每次鼠标移动都更新canvas容器中点相对图片左上角的坐标
   * @param e 鼠标事件
   */
  function handleMouseMove(e: any) {
    if (!drag) return;
    const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX;
    const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY;

    if (imgState.current.mx && imgState.current.my) {
      const mxDiff = (imgState.current.mx - mousePositionX) * ratio; // 鼠标全局移动的x,y方向上的距离
      const myDiff = (imgState.current.my - mousePositionY) * ratio;

      const { x: leftUpX, y: leftUpY } = getCroppingRect();

      const { xOriginalScale, yOriginalScale, newHeight, newWidth } = imgState.current;

      const relativeWidth = xOriginalScale / scale;
      const relativeHeight = yOriginalScale / scale;

      // canvas的中点坐标
      imgState.current = {
        ...imgState.current,
        x: leftUpX + mxDiff / (newWidth * scale) + relativeWidth / 2,
        y: leftUpY + myDiff / (newHeight * scale) + relativeHeight / 2,
        mx: mousePositionX,
        my: mousePositionY,
      };
      paintImage();
    }
  }

  function handleMouseUp() {
    drag && setDrag(false);
  }

  function handleMouseDown(e: any) {
    const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX;
    const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY;
    !drag && setDrag(true);
    imgState.current = { ...imgState.current, mx: mousePositionX, my: mousePositionY };
  }

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(maxScale, s + 0.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(minScale, s - 0.2));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp, handleMouseMove]);

  useEffect(() => {
    getImageInfo(img)
      .then((imageInfo) => {
        let newHeight: number;
        let newWidth: number;
        const xyRatio = imageInfo.width / imageInfo.height;
        const yxRatio = imageInfo.height / imageInfo.width;
        if (canvasYXRatio > yxRatio) {
          newHeight = height;
          newWidth = imageInfo.width * (newHeight / imageInfo.height);
        } else {
          newWidth = width;
          newHeight = imageInfo.height * (newWidth / imageInfo.width);
        }

        imgState.current = {
          ...imgState.current,
          resource: imageInfo.image,
          newHeight,
          newWidth,
          xyRatio,
          yxRatio,
          xOriginalScale: Math.min(1, canvasXYRatio / xyRatio),
          yOriginalScale: Math.min(1, canvasYXRatio / yxRatio),
        };
        paintImage();
      })
      .catch((e) => handleImageError(e));
  }, [img]);

  useEffect(() => {
    paintImage();
  }, [drag, scale]);

  useImperativeHandle(
    ref,
    () => ({
      getImageDataURL: () => canvas.current?.toDataURL() as any,
    }),
    []
  );

  return (
    <div className="image-editor">
      <canvas
        className={classnames('image-editor-canvas', 'image-editor-preview')}
        style={{ border, width: containerWidth, height: containerHeight }}
        ref={canvas}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
      />
      <div className="image-editor-scale">
        <div
          className={classnames('image-editor-zoom', 'image-editor-zoom-in', {
            'image-editor-zoom-disabled': isZoomInDisabled,
          })}
          onClick={handleZoomIn}
        >
          <Icon component={ZoomIn as any} className="image-editor-zoom-button" />
        </div>
        <div className="image-editor-division" />
        <div
          className={classnames('image-editor-zoom', 'image-editor-zoom-out', {
            'image-editor-zoom-disabled': isZoomOutDisabled,
          })}
          onClick={handleZoomOut}
        >
          <Icon component={ZoomOut as any} className="image-editor-zoom-button" />
        </div>
      </div>
    </div>
  );
});
