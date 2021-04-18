import React, { ReactChild } from 'react';
import { ModalProps } from 'antd/lib/modal';
import { DrawerProps } from 'antd/lib/drawer';

export type OpenModalOptions<T> = Omit<ModalProps, 'visible'> & {
  content?: ReactChild;
  component?: React.ComponentType<T>;
  componentProps?: T;
};

export type OpenDrawerOptions<T> = Omit<DrawerProps, 'visible'> & {
  content?: ReactChild;
  component?: React.ComponentType<T>;
  componentProps?: T;
};

export interface ModalManagerState {
  options: OpenModalOptions<any>;
  show: boolean;
  id: number;
  type: 'modal';
}

export interface DrawerManagerState {
  options: OpenDrawerOptions<any>;
  show: boolean;
  id: number;
  type: 'drawer';
}

export type WidgetManagerState = ModalManagerState | DrawerManagerState;

export interface ModalController<T> {
  destroy: () => void;
  hide: () => void;
  show: () => void;
  update: (newOptions: Partial<OpenModalOptions<T>>) => void;
}

export interface DrawerController<T> {
  destroy: () => void;
  hide: () => void;
  show: () => void;
  update: (newOptions: Partial<OpenDrawerOptions<T>>) => void;
}

export type OpenWidgetFunction = <T>(options: OpenModalOptions<T>, type: 'modal') => ModalController<T>;
export type OpenDrawerFunction = <T>(options: OpenDrawerOptions<T>, type: 'drawer') => DrawerController<T>;
