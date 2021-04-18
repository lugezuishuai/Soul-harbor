import React, { useRef } from 'react';
import { ImageEditor, RcRef } from '../image-editor';
import { dataURLtoFile } from '@/utils/dataUrlToFile';
import { ModalFooter } from '@/components/modal-footer';

import './index.less';

export interface ImageCropperProps {
  image: File | string;
  width?: number;
  height?: number;
  onCancel(): void;
  onOk(file: File): void;
  opacity?: number;
  ratio?: number;
}

export function ImageCropper(props: ImageCropperProps) {
  const { image, width = 240, height = 240, onCancel, onOk, opacity = 1, ratio = 1 } = props;
  const ref = useRef<RcRef>();

  function handleOk() {
    if (ref.current) {
      const newFile = dataURLtoFile(ref.current.getImageDataURL());
      onOk(newFile);
    }
  }

  return (
    <div className="image-cropper-body">
      <ImageEditor ref={ref as any} width={width} height={height} img={image} opacity={opacity} ratio={ratio} />
      <ModalFooter onOk={handleOk} onCancel={onCancel} okText="保存" className="image-cropper-footer" />
    </div>
  );
}
