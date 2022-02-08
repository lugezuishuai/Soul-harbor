import { ReactNode, MouseEvent, TouchEvent } from 'react';

/**
 * 图片 item 类型
 */
export interface imgData {
  key: string; // 唯一标识
  src: string; // 图片地址
  originRef?: HTMLElement | null; // 原触发ref
  intro?: ReactNode; // 图片介绍
}

export type brokenElementDataType = Pick<imgData, 'src' | 'intro'>;
export type brokenElementType = JSX.Element | ((imageProps: brokenElementDataType) => JSX.Element);

export interface OverlayRenderProps {
  images: imgData[]; // 图片列表
  index: number; // 图片当前索引
  visible: boolean; // 可见
  onClose: (e?: MouseEvent | TouchEvent) => void; // 关闭事件
  onIndexChange: (index: number) => void; // 索引改变回调
  overlayVisible: boolean; // 覆盖物可见性
  rotate: number; // 旋转角度
  onRotateChange: (rotate: number) => void; // 旋转事件
  scale: number; // 放大缩小
  onScaleChange: (scale: number) => void; // 放大缩小事件
}

export interface ImgViewerProviderBase {
  container?: HTMLElement; // 预览组件挂载的节点
  imgClosable?: boolean; // 图片点击关闭，默认true
  maskClosable?: boolean; // 背景点击关闭，默认true
  introVisible?: boolean; // 简介 visible，默认true
  overlayRender?: (overlayProps: OverlayRenderProps) => ReactNode; // 自定义渲染
  toolbarRender?: (overlayProps: OverlayRenderProps) => ReactNode; // 工具栏渲染
  className?: string; // 容器 className
  maskClassName?: string; // 蒙层 className
  imageClassName?: string; // 图片 className
  loadingElement?: JSX.Element; // 自定义 loading Element
  brokenElement?: brokenElementType; // 图片加载失败 Element
  onScaleChange?: (scale: number) => void; // 缩放图片时的回调
  onRotateChange?: (rotate: number) => void; // 旋转图片时的回调
}

/**
 * 动画类型
 */
export enum ShowAnimateEnum {
  None,
  In,
  Out,
}

/**
 * 触发源位置
 */
export type OriginRectType = { clientX: number; clientY: number } | undefined;

/**
 * 图片点击回调
 */
export type handleImgTapFn = (e?: MouseEvent | TouchEvent) => void;

/**
 * 点击蒙层回调
 */
export type handleMaskTapFn = (e?: MouseEvent | TouchEvent) => void;

/**
 * 滚轮事件回调
 */
export type handleWheelFn = (scale: number) => void;
