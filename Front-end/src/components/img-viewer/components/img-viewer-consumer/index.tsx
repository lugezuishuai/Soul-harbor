import React, {
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  TouchEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { uniqueId } from 'lodash-es';
import { ImgViewerContext } from '../img-viewer-context';
import { isTouchDevice } from '../../utils/is-touch-device';
import classnames from 'classnames';
import './index.less';

export type ImgViewerConsumerProps = PropsWithChildren<{
  src: string; // 图片src
  intro?: ReactNode; // 图片介绍
}>;

interface ImgPosition {
  clientX?: number;
  clientY?: number;
}

export function ImgViewerConsumer({ src, intro, children }: ImgViewerConsumerProps) {
  const { onShow, updateItem, removeItem } = useContext(ImgViewerContext);
  const key = useMemo(() => uniqueId(), []); // 为每张图片生成唯一的id
  const [position, updatePosition] = useState<ImgPosition>({}); // 图片的位置信息（给移动端使用）
  const imgTriggerRef = useRef<HTMLElement>();

  function handleTouchStart(e: TouchEvent) {
    const { clientX, clientY } = e.touches[0];
    updatePosition({
      clientX,
      clientY,
    });

    if (children) {
      const { onTouchStart } = (children as ReactElement).props;

      if (onTouchStart) {
        onTouchStart(e);
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    const { clientX, clientY } = e.changedTouches[0];

    if (position.clientX === clientX && position.clientY === clientY) {
      onShow(key);
    }

    if (children) {
      const { onTouchEnd } = (children as ReactElement).props;

      if (onTouchEnd) {
        onTouchEnd(e);
      }
    }
  }

  function handleClick(e: MouseEvent) {
    onShow(key);

    if (children) {
      const { onClick } = (children as ReactElement).props;

      if (onClick) {
        onClick(e);
      }
    }
  }

  useEffect(() => {
    return () => removeItem(key);
  }, [key, removeItem]);

  useEffect(() => {
    updateItem({
      key,
      src,
      originRef: imgTriggerRef.current,
      intro,
    });
  }, [intro, key, src, updateItem]);

  if (children) {
    return React.Children.only(
      React.cloneElement(
        children as ReactElement,
        isTouchDevice
          ? {
              onTouchStart: handleTouchStart,
              onTouchEnd: handleTouchEnd,
              ref: imgTriggerRef,
              className: classnames((children as JSX.Element).props.className, 'img-viewer__preview'),
            }
          : {
              onClick: handleClick,
              ref: imgTriggerRef,
              className: classnames((children as JSX.Element).props.className, 'img-viewer__preview'),
            },
      ),
    );
  }

  return <></>;
}
