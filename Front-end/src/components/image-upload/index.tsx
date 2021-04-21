import { Spin, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { noop } from '@/utils/noop';
import classnames from 'classnames';
import defaultIcon from '@/assets/image/upload-fill.png';
import { cropperImageFile } from './cropper-image-file';

import './index.less';

export interface ImageUploadProps {
  onChange?: (value: string) => void;
  size?: number | { width: number; height: number }; // 预览图标的尺寸
  value?: string; // 预览图标的src
  beforeUpload?: (file: RcFile, files: RcFile[]) => boolean | Promise<void>; // 校验函数
  accept?: string;
  disabled?: boolean;
  defaultImage?: string;
  convertFile?: (f: File) => Promise<File>;
  className?: string;
  upload: (file: File) => Promise<string>;
  render?: (value?: string) => ReactNode;
}

export function ImageUpload(props: PropsWithChildren<ImageUploadProps>) {
  const {
    onChange = noop,
    render,
    size = 64,
    value,
    upload,
    beforeUpload = noop,
    accept = 'image/png, image/jpeg, image/svg+xml, image/bmp',
    disabled = false,
    defaultImage = defaultIcon,
    convertFile = cropperImageFile,
    className,
  } = props;

  const [loading, setLoading] = useState(false);
  const height = typeof size == 'object' ? size.height : size;
  const width = typeof size == 'object' ? size.width : size;

  // 上传图片
  async function handleRequest(options: any) {
    const { onSuccess, onError } = options;
    try {
      const file = await convertFile(options.file);
      setLoading(true);
      const url = await upload(file as File);
      // 调用antd成功事件
      onSuccess({ url });
      onChange(url);
    } catch (e) {
      console.error('upload Error: ', e);
      onError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Upload
      accept={accept}
      disabled={disabled || loading}
      type="select"
      showUploadList={false}
      beforeUpload={beforeUpload}
      className={classnames('image-upload', className)}
      customRequest={handleRequest}
    >
      <Spin spinning={loading}>
        {render ? (
          render(value)
        ) : (
          <div
            style={{
              width,
              height,
              backgroundImage: `url(${value || defaultImage})`,
              backgroundSize: value ? 'cover' : undefined,
              backgroundRepeat: 'no-repeat',
              borderRadius: Math.min(width, height) / 6,
            }}
            className={classnames(disabled ? 'image-upload-icon-disabled' : 'image-upload-icon', 'rect-wrapper-icon')}
          />
        )}
      </Spin>
    </Upload>
  );
}

ImageUpload.cropperImageFile = cropperImageFile;
