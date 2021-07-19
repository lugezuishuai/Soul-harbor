import React from 'react';
import { ImageCropper } from '../image-cropper';
import { openWidget } from '@/components/open-widget';
import Close from '@/assets/icon/close.svg';
import { Icon } from 'antd';
import './index.less';

export interface convertFileDefaultOptions {
  opacity?: number;
  title?: string;
  width?: number;
  height?: number;
  ratio?: number;
}

export interface CropperImgFileTitleProps {
  title?: string;
  onCancel(): void;
}

export function CropperImgFileTitle(props: CropperImgFileTitleProps) {
  const { title, onCancel } = props;

  return (
    <div className="image-cropper-modal-header">
      <div className="image-cropper-modal-header-text">{title || '编辑应用图标'}</div>
      <Icon className="image-cropper-modal-header-close" component={Close as any} onClick={onCancel} />
    </div>
  );
}

export function cropperImageFile(image: File | string, options: convertFileDefaultOptions = {}) {
  return new Promise(async (resolve: (f: File | null) => void, reject) => {
    function onCancel() {
      hide();
      reject();
    }
    const { opacity = 1, title, width = 240, height = 240, ratio = 1 } = options;
    const { hide } = await openWidget('modal', {
      title: <CropperImgFileTitle title={title} onCancel={onCancel} />,
      footer: null,
      content: (
        <ImageCropper
          width={width}
          height={height}
          ratio={ratio}
          image={image}
          opacity={opacity}
          onOk={(file: File) => {
            hide();
            resolve(file);
          }}
          onCancel={onCancel}
        />
      ),
      className: 'image-cropper-modal',
      closable: false,
      centered: true,
      width: width + 180,
    });
  });
}
