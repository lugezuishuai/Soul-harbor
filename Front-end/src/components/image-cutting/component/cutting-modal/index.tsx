import { Button, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getPixelRatio } from '../../utils/getPixelRatio';
import './index.less';

interface CuttingModalProps {
  onCancel(): void;
}

export function CuttingModal({ onCancel }: CuttingModalProps) {
  const [dataUrl, setDataUrl] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initSize: {
    width: number;
    height: number;
    proportion: number;
  } = {
    width: 500,
    height: 500,
    proportion: 1,
  };

  let ratio: number;
  let ctx: CanvasRenderingContext2D;
  let createUrl = '';
  let img: HTMLImageElement;

  let imgSize = {} as {
    width: number;
    height: number;
  };

  let canvasSize = {} as {
    width: number;
    height: number;
  };

  /**
   * 鼠标滑动事件
   * @param e
   */
  function mouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!ctx || !canvasRef.current) {
      return;
    }

    const { offsetX, offsetY } = e.nativeEvent;
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
    const { width: imgWidth, height: imgHeight } = img;
    const imgProportion = imgWidth / imgHeight; // 宽高比

    imgSize = {
      width: imgWidth,
      height: imgHeight,
    };
  }

  function handleChooseImg() {
    if (createUrl) {
      window.URL.revokeObjectURL(createUrl);
    }

    if (inputRef.current?.files && inputRef.current.files.length > 0) {
      createUrl = window.URL.createObjectURL(inputRef.current.files[0]);

      img = new Image();
      img.onload = () => {};
    }
  }

  useEffect(() => {
    try {
      if (canvasRef.current) {
        ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        ratio = getPixelRatio(ctx);
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
