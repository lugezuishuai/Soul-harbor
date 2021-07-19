import { Button, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { checkSelectBoundary } from './utils/checkSelectBoundary';
import { getAnewXY } from './utils/getAnewXY';
import { getCursorStyle } from './utils/getCursorStyle';
import { getDashPosition } from './utils/getDashPosition';
import { getDotPosition } from './utils/getDotPosition';
import { getGrayScaleData } from './utils/getGrayScaleData';
import { getImageData } from './utils/getImageData';
import { getMousePosition } from './utils/getMousePosition';
import { getPixelRatio } from './utils/getPixelRatio';
import { getSelectRectInfo } from './utils/handleSelectRectInfo';
import { SelectPosition } from './type';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import './index.less';

interface CuttingModalProps {
  onCancel(): void;
  acceptFileType?: string;
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

interface InitMousePosition {
  x: number;
  y: number;
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

export function CuttingModal({
  onCancel,
  acceptFileType = 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
}: CuttingModalProps) {
  const [dataUrl, setDataUrl] = useState<string>(); // 截取图片的base64
  const [canChangeSelect, setCanChangeSelect] = useState(false); // 选择框是否可以改变

  const resetSelect = useRef(false); // 重置图片的标志
  const openGray = useRef(false); // 是否开启灰度
  const ratio = useRef(1); // 物理像素与CSS像素之比
  const rotate = useRef(0); // 图片旋转角度
  const cursorIndex = useRef<number | null>(null); // 鼠标的表示方式
  const tempCursorIndex = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createURL = useRef<string>('');
  const ctx = useRef<CanvasRenderingContext2D>();
  const imageInfo = useRef<ImageInfo>({
    imgScale: 1, // 图片缩放比
    initSize: {
      width: 500,
      height: 500,
      proportion: 1,
    },
  });
  const mousePosition = useRef<number[][]>([]);
  const selectPosition = useRef<SelectPosition>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }); // 所框选的矩形的坐标和宽高信息
  const initMousePosition = useRef<InitMousePosition | null>(null);
  const canvasSize = useRef<CanvasSize | null>(null);

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
   * 绘制图片
   */
  function drawImage() {
    if (canvasSize.current && ctx.current) {
      let { width: canvasWidth, height: canvasHeight } = canvasSize.current;
      const { imgSize, imgScale, img } = imageInfo.current;

      ctx.current.save();
      ctx.current.globalCompositeOperation = 'destination-over'; // 在当前画布的下面绘制图像
      ctx.current.translate(canvasWidth / 2, canvasHeight / 2); // 先平移后旋转
      ctx.current.rotate((Math.PI / 180) * rotate.current);

      if (rotate.current % 180 !== 0) {
        [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
      }
      ctx.current.translate(-canvasWidth / 2, -canvasHeight / 2); // 旋转完之后平移会原来的位置，这样就可以做到一中心店为轴旋转

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

        if (openGray.current) {
          const imgData = ctx.current.getImageData(0, 0, canvasWidth * ratio.current, canvasHeight * ratio.current);
          getGrayScaleData(imgData);
          ctx.current.putImageData(imgData, 0, 0); // 将经过灰度处理的图像绘制到位图上
        }
      }

      ctx.current.restore();
    }
  }

  /**
   * 画蒙层
   */
  function drawCover() {
    if (ctx.current && canvasSize.current) {
      const { width: canvasWidth, height: canvasHeight } = canvasSize.current;
      ctx.current.save();
      ctx.current.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.current.globalCompositeOperation = 'source-atop'; // 新图形只在与现有画布内容重叠的地方绘制。
      ctx.current.restore();
    }
  }

  /**
   * 绘制选择框
   * @param selectRect 选中的矩形框信息
   */
  function drawSelect(selectRect: SelectPosition) {
    const { x, y, w, h } = selectRect;
    if (ctx.current && canvasSize.current) {
      const { width: canvasWidth, height: canvasHeight } = canvasSize.current;
      ctx.current.clearRect(0, 0, canvasWidth, canvasHeight);
      drawCover(); // 先画蒙层
      ctx.current.clearRect(x, y, w, h); // 清空选择框部分
      ctx.current.strokeStyle = '#5696f8';
      ctx.current.strokeRect(x, y, w, h);

      // 绘制8个点
      ctx.current.fillStyle = '#5696f8';
      const dots = getDotPosition(x, y, w, h);
      // @ts-ignore
      dots.map((v) => ctx.current && ctx.current.fillRect(...v));

      // 绘制虚线
      ctx.current.lineWidth = 1;
      ctx.current.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      const dashs = getDashPosition(x, y, w, h);
      dashs.forEach((v) => {
        if (ctx.current) {
          ctx.current.beginPath();
          ctx.current.setLineDash([2, 4]);
          ctx.current.moveTo(v[0], v[1]);
          ctx.current.lineTo(v[2], v[3]);
          ctx.current.closePath();
          ctx.current.stroke();
        }
      });

      ctx.current.restore();
      drawImage();

      mousePosition.current = getMousePosition(x, y, w, h);
      mousePosition.current.push([x, y, w, h]);
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
    const result = ctx.current.isPointInPath(pathX, pathY); // 判断在当前路径上是否包含检测点
    ctx.current.closePath();
    return result;
  }

  /**
   * 鼠标按下事件
   * @param e
   */
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!imageInfo.current.img) {
      return;
    }

    if (cursorIndex.current === 9) {
      resetSelect.current = true;
    }

    !canChangeSelect && setCanChangeSelect(true);
    const { offsetX, offsetY } = e.nativeEvent;
    initMousePosition.current = {
      x: offsetX,
      y: offsetY,
    };
  }

  /**
   * 鼠标滑动事件
   * @param e
   */
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!ctx.current || !canvasRef.current || !imageInfo.current.img) {
      return;
    }

    const { offsetX, offsetY } = e.nativeEvent;
    const pathX = offsetX * ratio.current;
    const pathY = offsetY * ratio.current;

    let cursor = 'crosshair'; // 交叉指针
    cursorIndex.current = 9;

    for (let i = 0; i < mousePosition.current.length; i++) {
      if (checkInPath(pathX, pathY, mousePosition.current[i])) {
        // 如果当前坐标在已选择的路径上
        cursor = getCursorStyle(i);
        cursorIndex.current = i;
        break;
      }
    }

    canvasRef.current.style.cursor = cursor;

    if (!canChangeSelect) {
      return;
    }

    if (initMousePosition.current) {
      const { x: initX, y: initY } = initMousePosition.current;
      if (resetSelect.current) {
        selectPosition.current = {
          x: initX,
          y: initY,
          w: 4,
          h: 4,
        };
        tempCursorIndex.current = 2;
        resetSelect.current = false;
      }

      const distanceX = initX ? offsetX - initX : offsetX;
      const distanceY = initY ? offsetY - initY : offsetY;

      selectPosition.current = getSelectRectInfo(
        tempCursorIndex.current || cursorIndex.current,
        selectPosition.current,
        { x: distanceX, y: distanceY }
      );

      if (canvasSize.current) {
        const { width: canvasWidth, height: canvasHeight } = canvasSize.current;
        selectPosition.current = checkSelectBoundary(canvasWidth, canvasHeight, selectPosition.current);
      }

      drawSelect(selectPosition.current); // 绘制选择框以及选择图片

      initMousePosition.current = {
        x: offsetX,
        y: offsetY,
      };

      if (isNullOrUndefined(tempCursorIndex.current)) {
        tempCursorIndex.current = cursorIndex.current;
      }
    }
  }

  /**
   * 鼠标抬起事件
   */
  const handleMouseUp = useCallback(async () => {
    try {
      if (!imageInfo.current.img) {
        return;
      }

      if (selectPosition.current.w < 0 || selectPosition.current.h < 0) {
        // 为了应对将选中框矩形移动到原点对称的位置
        selectPosition.current = getAnewXY(selectPosition.current);

        const { x, y, w, h } = selectPosition.current;
        mousePosition.current = getMousePosition(x, y, w, h);
      }

      if (canChangeSelect) {
        dataUrl && window.URL.revokeObjectURL(dataUrl);
        setCanChangeSelect(false);

        const { imgSize, imgScale, img } = imageInfo.current;
        if (imgSize && img && canvasSize.current) {
          const blob = await getImageData({
            imgSize,
            rotate: rotate.current,
            img,
            canvasSize: canvasSize.current,
            imgScale,
            selectPosition: selectPosition.current,
            openGray: openGray.current,
          });

          if (blob) {
            const newDataUrl = window.URL.createObjectURL(blob);
            setDataUrl(newDataUrl);
          }
        }
      }

      tempCursorIndex.current = null;
    } catch (e) {
      console.error(e);
    }
  }, [canChangeSelect, dataUrl]);

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

    let imgScale: number;
    if (imgWidth <= initSize.width && imgHeight <= initSize.height) {
      imgScale = 1;
    } else {
      imgScale = imgProportion > initSize.proportion ? initSize.width / imgWidth : initSize.height / imgHeight;
    }

    imageInfo.current = {
      ...imageInfo.current,
      imgScale,
      imgSize,
    };
  }

  /**
   * 获取初始的dataUrl
   */
  function initDataUrl() {
    if (canvasRef.current) {
      setDataUrl(canvasRef.current.toDataURL('image/png'));
    }
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
          initDataUrl();
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

  /**
   * 旋转
   */
  function handleRotate() {
    if (!imageInfo.current.img) {
      return;
    }

    rotate.current = rotate.current === 270 ? 0 : rotate.current + 90;
    calcCanvasSize();
    drawImage();
  }

  /**
   * 缩放
   * @param status true: 放大，false: 缩小
   */
  function handleScale(status: boolean) {
    if (!imageInfo.current.img) {
      return;
    }

    const _status = status ? 1 : -1;
    imageInfo.current.imgScale += 0.1 * _status;
    calcCanvasSize();
    drawImage();
  }

  /**
   * 灰度
   */
  function handleGrayScale() {
    if (!imageInfo.current.img) {
      return;
    }

    openGray.current = !openGray.current;
    mousePosition.current = [];

    if (ctx.current && canvasSize.current) {
      const { width: canvasWidth, height: canvasHeight } = canvasSize.current;
      ctx.current.clearRect(0, 0, canvasWidth, canvasHeight);
      drawImage();
    }
  }

  /**
   * 重置
   */
  function handleReset() {
    if (!imageInfo.current.img) {
      return;
    }

    rotate.current = 0;
    openGray.current = false;
    const { img } = imageInfo.current;
    img && initImageCanvas(img);
    calcCanvasSize();
    drawImage();
    initDataUrl();
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

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);

    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  return (
    <>
      <div className="image-cutting-content">
        <div className="image-cutting-content__canvas">
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown}>
            浏览器不支持canvas
          </canvas>
        </div>
        <div className="image-cutting-content__operation">
          <div className="image-cutting-content__image">{dataUrl && <img src={dataUrl} alt="canvas" />}</div>
          <Button type="primary" className="image-cutting-content__btn" style={{ width: 100, borderRadius: 4 }}>
            <input
              className="image-cutting-content__input"
              ref={inputRef}
              type="file"
              onChange={handleChooseImg}
              accept={acceptFileType}
            />
            选择图片
          </Button>
          <div>
            <Button type="primary" className="image-cutting-content__btn" ghost onClick={() => handleScale(true)}>
              放大
            </Button>
            <Button type="primary" className="image-cutting-content__btn" ghost onClick={() => handleScale(false)}>
              缩小
            </Button>
          </div>
          <Button type="primary" className="image-cutting-content__btn" ghost onClick={handleRotate}>
            旋转
          </Button>
          <Button type="primary" className="image-cutting-content__btn" ghost onClick={handleGrayScale}>
            灰度
          </Button>
          <Button type="primary" className="image-cutting-content__btn" ghost onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" className="image-cutting-content__btn">
            <a href={dataUrl} download="canvas.png">
              下载
            </a>
          </Button>
        </div>
      </div>
      <div className="image-cutting-footer">
        <Button className="image-cutting-footer__btn" onClick={onCancel}>
          取消
        </Button>
      </div>
    </>
  );
}
