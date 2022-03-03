import { ImgViewerContext, updateItemType } from '../img-viewer-context';
import { ImgViewerProviderBase, imgData } from '../../types';
import React, { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
import { ImgViewerConsumer } from '../img-viewer-consumer';
import { ImgViewerSlider } from '../img-viewer-slider';

export interface ImageInfo {
  index: number; // 图片索引
  images: imgData[]; // 图片数据
}

export interface ImgViewerProviderBaseProps extends ImgViewerProviderBase {
  imgNodeFilter?: ((node: JSX.Element) => boolean) | boolean; // 图片节点筛选
  onIndexChange?: (imageInfo: ImageInfo) => void; // 图片切换时的回调
  onVisibleChange?: (visible: boolean, imageInfo: ImageInfo) => void; // 预览组件显示隐藏时的回调
}

export type ImgViewerProviderProps = PropsWithChildren<ImgViewerProviderBaseProps>;

export function ImgViewerProvider({
  onIndexChange,
  onVisibleChange,
  imgNodeFilter = (node) => node.type === 'img',
  children,
  ...restProps
}: ImgViewerProviderProps) {
  const [visible, setVisible] = useState(false); // 控制预览组件展示与否
  const [imageInfo, setImageInfo] = useState<ImageInfo>({
    index: 0,
    images: [],
  }); // 当前图片索引和图片信息数组

  // 更改图片
  const handleUpdateItem = useCallback<updateItemType>((imageItem) => {
    setImageInfo((prev) => {
      const { images } = prev;
      const index = images.findIndex((n) => n.key === imageItem.key);

      if (index > -1) {
        // 替换掉原有的图片
        images.splice(index, 1, imageItem);
        return {
          ...prev,
          images: [...images],
        };
      }

      // 追加图片
      return {
        ...prev,
        images: images.concat(imageItem),
      };
    });
  }, []);

  // 移除图片
  const handleRemoveItem = useCallback((key: string) => {
    setImageInfo((prev) => {
      const { images, index } = prev;
      const nextImages = images.filter((item) => item.key !== key);
      const nextEndIndex = nextImages.length - 1;

      return {
        images: nextImages,
        index: Math.min(nextEndIndex, index),
      };
    });
  }, []);

  // 展示预览组件
  const handleShow = useCallback(
    (key: string) => {
      const { images } = imageInfo;
      const newImageInfo: ImageInfo = {
        ...imageInfo,
        index: images.findIndex((item) => item.key === key),
      };
      setImageInfo(newImageInfo);

      setVisible(true);

      if (onVisibleChange) {
        onVisibleChange(true, newImageInfo);
      }
    },
    [imageInfo, onVisibleChange],
  );

  // 关闭预览组件
  const handleClose = useCallback(() => {
    setVisible(false);

    if (onVisibleChange) {
      onVisibleChange(false, imageInfo);
    }
  }, [imageInfo, onVisibleChange]);

  // 切换图片
  const handleIndexChange = useCallback(
    (index: number) => {
      const newImageInfo: ImageInfo = {
        ...imageInfo,
        index,
      };

      setImageInfo(newImageInfo);

      if (onIndexChange) {
        onIndexChange(newImageInfo);
      }
    },
    [imageInfo, onIndexChange],
  );

  const newChildren = useMemo<ReactNode>(() => {
    return React.Children.map(children, (child) => {
      if (
        React.isValidElement(child) &&
        ((typeof imgNodeFilter === 'function' && imgNodeFilter(child)) || imgNodeFilter)
      ) {
        const src = child.props.src;

        if (src) {
          return <ImgViewerConsumer src={src}>{child}</ImgViewerConsumer>;
        }

        return child;
      }

      return child;
    });
  }, [children, imgNodeFilter]);

  return (
    <ImgViewerContext.Provider
      value={{ onShow: handleShow, updateItem: handleUpdateItem, removeItem: handleRemoveItem }}
    >
      {newChildren}
      <ImgViewerSlider
        images={imageInfo.images}
        visible={visible}
        index={imageInfo.index}
        onIndexChange={handleIndexChange}
        onClose={handleClose}
        {...restProps}
      />
    </ImgViewerContext.Provider>
  );
}
