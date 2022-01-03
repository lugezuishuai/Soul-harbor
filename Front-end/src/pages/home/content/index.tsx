import React, { useRef, useEffect, useCallback } from 'react';
import testImg from '@/assets/image/test.png';
import { getImageInfo } from '@/utils/getImageInfo';
import { dataURLtoFile } from '@/utils/dataUrlToFile';
import { Button } from 'antd';
import { imageCutting } from '@/components/image-cutting';
import { Utils } from '../../../components/change-svg-color';
import { Link } from 'react-router-dom';
import { SideMenu } from '@/components/side-menu';
import './index.less';

const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 240;

export default function Content() {
  const canvas = useRef<HTMLCanvasElement>(null);

  const initImg = useCallback(async () => {
    const { image } = await getImageInfo(testImg);
    if (image && canvas.current) {
      const context = canvas.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }
  }, []);

  function handleClick() {
    if (!canvas.current) {
      return;
    }

    const newFile = dataURLtoFile(canvas.current.toDataURL('image/png', 1));
    console.log('新文件的大小', newFile.size);
  }

  useEffect(() => {
    initImg();
  }, [initImg]);

  return (
    <div className="content-page">
      <SideMenu>
        <div>这是内容</div>
      </SideMenu>
      <div className="content-page__content">
        <canvas
          className="image-editor-canvas"
          style={{ width: 240, height: 240 }}
          ref={canvas}
          width={240}
          height={240}
          onClick={handleClick}
        />
        <Button type="primary" onClick={imageCutting} className="content-page__btn">
          尝试一下
        </Button>
        <Link to="/markdown">
          <Button type="primary" className="content-page__btn">
            markdown
          </Button>
        </Link>
        <Utils />
      </div>
    </div>
  );
}
