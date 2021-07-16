import { Button, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getCursorStyle } from '../../utils/getCursorStyle';
import { getPixelRatio } from '../../utils/getPixelRatio';
import './index.less';

interface CuttingModalProps {
  onCancel(): void;
}

interface InitSize {
  width: number;
  height: number;
  proportion: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

export interface ImageInfo {
  img?: HTMLImageElement;
  imgSize?: {
    width: number;
    height: number;
  };
  imgScale: number;
  initSize: InitSize;
}

export function CuttingModal({ onCancel }: CuttingModalProps) {
  const [dataUrl, setDataUrl] = useState<string>();
  const ratio = useRef(1); // 设备的物理像素和CSS像素比
  const rotate = useRef(0); // 图片旋转角度
  const cursorIndex = useRef<number>(); // 鼠标的表示方式

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createURL = useRef<string>('');
  const ctx = useRef<CanvasRenderingContext2D>();
  const imageInfo = useRef<ImageInfo>({
    imgScale: 1,
    initSize: {
      width: 500,
      height: 500,
      proportion: 1,
    },
  });
  const mousePosition = useRef<number[][]>([]);
  const canvasSize = useRef<CanvasSize>({} as CanvasSize);

  /**
   * 计算canvas-size
   */
  function calcCanvasSize() {
    if (!canvasRef.current) {
      throw new Error('canvasRef not dom');
    }

    let canvasWidth = imageInfo.current.imgSize
      ? Math.min(imageInfo.current.initSize.width, imageInfo.current.imgSize.width * imageInfo.current.imgScale)
      : imageInfo.current.initSize.width;

    let canvasHeight = imageInfo.current.imgSize
      ? Math.min(imageInfo.current.initSize.width, imageInfo.current.imgSize.height * imageInfo.current.imgScale)
      : imageInfo.current.initSize.height;

    if (rotate.current % 180 !== 0) {
      [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
    }

    canvasRef.current.style.width = `${canvasWidth}px`;
    canvasRef.current.style.height = `${canvasHeight}px`;
    canvasRef.current.width = canvasWidth * ratio.current;
    canvasRef.current.height = canvasHeight * ratio.current;

    ctx.current && ctx.current.scale(ratio.current, ratio.current);

    canvasSize.current = {
      width: canvasWidth,
      height: canvasHeight,
    };

    mousePosition.current = [];
  }

  /**
   * 绘画图片
   */
  function drawImage() {
    if (canvasSize.current.width && canvasSize.current.height && ctx.current) {
      let { width: canvasWidth, height: canvasHeight } = canvasSize.current;
      const { imgSize, imgScale, img } = imageInfo.current;

      ctx.current.save();
      ctx.current.globalCompositeOperation = 'destination-over'; // 在当前画布的下面绘制图像
      ctx.current.rotate((Math.PI / 180) * rotate.current);

      if (rotate.current % 180 !== 0) {
        [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
      }

      if (imgSize?.width && imgSize.height && img) {
        const scaleImgWidth = imgScale * imgSize.width;
        const scaleImgHeight = imgScale * imgSize.height;

        ctx.current.drawImage(
          img,
          (canvasWidth - scaleImgWidth) / 2,
          (canvasHeight - scaleImgHeight) / 2,
          scaleImgWidth,
          scaleImgHeight
        );
      }
    }
  }

  /**
   * 画蒙层
   */
  function drawCover() {
    const { width: canvasWidth, height: canvasHeight } = canvasSize.current;
    if (ctx.current && canvasWidth && canvasHeight) {
      ctx.current.save();
      ctx.current.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.current.globalCompositeOperation = 'source-atop'; // 新图形只在与现有画布内容重叠的地方绘制。
      ctx.current.restore();
    }
  }

  /**
   * 判断x,y是否在select路径上
   * @param pathX
   * @param pathY
   * @param rectPosition
   */
  function checkInPath(pathX: number, pathY: number, rectPosition: number[]) {
    if (!ctx.current) {
      return false;
    }
    ctx.current.beginPath();
    // @ts-ignore
    ctx.current.rect(...rectPosition);
    const result = ctx.current.isPointInPath(pathX, pathY);
    ctx.current.closePath();
    return result;
  }

  /**
   * 鼠标滑动事件
   * @param e
   */
  function mouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!ctx || !canvasRef.current) {
      return;
    }

    const { offsetX, offsetY } = e.nativeEvent;
    const pathX = offsetX * ratio.current;
    const pathY = offsetY * ratio.current;

    let cursor = 'crosshair';
    cursorIndex.current = 9;

    for (let i = 0; i < mousePosition.current.length; i++) {
      if (checkInPath(pathX, pathY, mousePosition.current[i])) {
        cursor = getCursorStyle(i);
        cursorIndex.current = i;
        break;
      }
    }
  }

  /**
   * mouseDown事件
   * @param e
   */
  function mouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {}

  /**
   * canvas绘制图片初始化
   * @param img
   */
  function initImageCanvas(img: HTMLImageElement) {
    const { initSize } = imageInfo.current;
    const { width: imgWidth, height: imgHeight } = img;
    const imgProportion = imgWidth / imgHeight; // 宽高比

    const imgSize = {
      width: imgWidth,
      height: imgHeight,
    };

    if (imgWidth <= initSize.width && imgHeight <= initSize.height) {
      return;
    }

    let imgScale: number;
    if (imgProportion > initSize.proportion) {
      imgScale = initSize.width / imgWidth;
    } else {
      imgScale = initSize.height / imgHeight;
    }

    imageInfo.current = {
      ...imageInfo.current,
      imgScale,
      imgSize,
    };
  }

  /**
   * 选择图片
   */
  function handleChooseImg() {
    try {
      if (createURL.current) {
        window.URL.revokeObjectURL(createURL.current);
      }

      if (inputRef.current?.files && inputRef.current.files.length > 0) {
        createURL.current = window.URL.createObjectURL(inputRef.current.files[0]);

        const img = new Image();
        img.onload = () => {
          initImageCanvas(img);
          calcCanvasSize();
          drawImage();
        };
        img.src = createURL.current;
        imageInfo.current = {
          ...imageInfo.current,
          img,
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    try {
      if (canvasRef.current && !ctx.current) {
        ctx.current = canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        ratio.current = getPixelRatio(ctx.current);
      }
    } catch (e) {
      console.error(e);
      message.error('浏览器不支持canvas');
    }
  }, []);

  return (
    <>
      <div className="cutting-modal">
        <div className="cutting-modal-canvas-box">
          <canvas ref={canvasRef} onMouseMove={mouseMove} onMouseDown={mouseDown} />
        </div>
      </div>
      <div className="cutting-modal-footer">
        <Button className="cutting-modal-footer__btn" onClick={onCancel}>
          取消
        </Button>
      </div>
    </>
  );
}
