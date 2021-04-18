import React, { useState, useCallback, useEffect } from 'react';
import {
  OpenWidgetFunction,
  WidgetManagerState,
  OpenModalOptions,
  ModalManagerState,
  DrawerManagerState,
  OpenDrawerOptions,
  OpenDrawerFunction,
} from './types';
import { Drawer, Modal } from 'antd';

let uniqueId = 0;

export const points: (OpenWidgetFunction | OpenDrawerFunction)[] = [];

export function useWidgetManager(initData: WidgetManagerState[] = []) {
  const [widgets, setWidget] = useState(initData);

  const openWidget = useCallback(function <P>(
    options: OpenModalOptions<P> | OpenDrawerOptions<P>,
    type: 'modal' | 'drawer' = 'modal'
  ) {
    uniqueId += 1;
    const id = uniqueId;

    // 直接移除dom
    function remove() {
      setWidget((state) => state.filter((modal) => modal.id !== id));
    }

    // 更新一个widget
    function update(action: ((state: any) => any) | any) {
      setWidget((state) =>
        state.map((widget) =>
          widget.id === id ? (typeof action === 'function' ? action(widget) : { ...widget, ...action }) : widget
        )
      );
    }

    // 执行关闭动画后移除dom结构
    function destroy() {
      update((widget: WidgetManagerState) => ({
        ...widget,
        show: false,
        options: {
          ...widget.options,
          afterClose: remove,
          afterVisibleChange: (v: boolean) => !v && remove(),
        },
      }));
    }

    async function onCancel(e: React.MouseEvent<HTMLElement>) {
      try {
        if (typeof (options as OpenModalOptions<P>).onCancel === 'function') {
          await (options as OpenModalOptions<P>).onCancel?.(e);
        }
        destroy();
      } catch (err) {
        console.error(err);
      }
    }

    async function onClose(e: any) {
      try {
        if (typeof (options as OpenDrawerOptions<P>).onClose === 'function') {
          await (options as OpenDrawerOptions<P>).onClose?.(e);
        }
        destroy();
      } catch (err) {
        console.error(err);
      }
    }

    async function onOk(e: React.MouseEvent<HTMLElement>) {
      try {
        if (typeof (options as OpenModalOptions<P>).onOk === 'function') {
          await (options as OpenModalOptions<P>).onOk?.(e);
        }
        destroy();
      } catch (err) {
        console.error(err);
      }
    }

    /**
     * 更新options
     * @param newOptions
     */
    function updateOptions(newOptions: Partial<OpenModalOptions<P>>) {
      Object.assign(options, newOptions);
      update((modal: WidgetManagerState) => ({
        ...modal,
        options: { ...options, onCancel, onOk },
      }));
    }

    /**
     * 更新options
     * @param newOptions
     */
    function updateDrawer(newOptions: Partial<OpenDrawerOptions<P>>) {
      Object.assign(options, newOptions);
      update((modal: WidgetManagerState) => ({
        ...modal,
        options: { ...options, onClose },
      }));
    }

    setWidget((prevState: WidgetManagerState[]) => {
      const newState = {
        options: { ...options },
        id,
        show: true,
        type,
      } as WidgetManagerState;
      if (type === 'modal') {
        (newState as ModalManagerState).options.onOk = onOk;
        (newState as ModalManagerState).options.onCancel = onCancel;
      } else {
        (newState as DrawerManagerState).options.onClose = onClose;
      }
      return [...prevState, newState];
    });

    if (type === 'modal') {
      return {
        destroy,
        hide: () => update({ show: false }),
        show: () => update({ show: true }),
        update: updateOptions,
      };
    }
    return {
      destroy,
      hide: () => update({ show: false }),
      show: () => update({ show: true }),
      update: updateDrawer,
    };
  },
  []);

  useEffect(() => {
    points.push(openWidget);
    return () => {
      points.splice(points.indexOf(openWidget), 1);
    };
  }, [openWidget]);

  return {
    openWidget,
    widgets: widgets.map((modal) => {
      const {
        options: { content, component: Component, componentProps, ...other },
        show,
        id,
        type,
      } = modal;
      let child = content;
      const Wrapper: any = type === 'drawer' ? Drawer : Modal;

      if (Component) {
        child = <Component {...componentProps} />;
      }
      return (
        <Wrapper {...other} visible={show} key={id}>
          {child}
        </Wrapper>
      );
    }),
    clear: () => setWidget([]),
  };
}
