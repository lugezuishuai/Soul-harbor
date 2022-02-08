import React, { HTMLAttributes, PropsWithChildren, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import './index.less';

interface SlideWrapBaseProps extends HTMLAttributes<HTMLDivElement> {
  container?: HTMLElement; // 挂载的节点
}

export type SlideWrapProps = PropsWithChildren<SlideWrapBaseProps>;

export function SlideWrap(props: SlideWrapProps) {
  const { container, className, children, ...restProps } = props;
  const dialogNode = useRef<HTMLElement>(document.createElement('section'));
  const originalOverflow = useRef(''); // 缓存容器原来的overflow属性
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    const wrapContainer: HTMLElement = container || document.body;
    wrapContainer.appendChild(dialogNode.current); // 将portal挂载到容器上
    const { style } = wrapContainer;
    originalOverflow.current = style.overflow;
    style.overflow = 'hidden';

    return () => {
      style.overflow = originalOverflow.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      wrapContainer.removeChild(dialogNode.current); // 清除节点
    };
  }, [container]);

  useEffect(() => {
    // 阻止默认行为
    function preventDefault(e: WheelEvent) {
      e.preventDefault();
    }

    const slider = ref.current;
    if (!slider) {
      return;
    }

    slider.addEventListener('wheel', preventDefault);

    return () => slider.removeEventListener('wheel', preventDefault);
  }, []);

  return createPortal(
    <div ref={ref as any} className={classnames('img-viewer-slider__wrap', className)} {...restProps}>
      {children}
    </div>,
    dialogNode.current,
  );
}
