import { ReactNode } from 'react';

export interface imgData {
  src: string; // 图片地址
  key?: string; // 唯一标识
  originRef?: HTMLElement | null; // 原触发ref
  intro?: ReactNode; // 图片介绍
}

export type brokenElementDataType = Pick<imgData, 'src' | 'intro'>;
export type brokenElementType = JSX.Element | ((imageProps: brokenElementDataType) => JSX.Element);

export interface ToolbarProps {
  images: imgData[]; // 图片列表
  index: number; // 图片当前索引
  visible: boolean; // 可见
  scale: number; // 缩放比例
  rotate: number; // 旋转角度
  handlePrev: () => void; // 点击上一张
  handleNext: () => void; // 点击下一张
  handleZoom: (scale?: number, isZoomIn?: boolean, forbiddenTransition?: boolean) => void; // 缩放
  switchMode: () => void; // 切换模式（适应页面/原始比例）
  handleRotate: (rotate?: number) => void; // 旋转
}

export interface ImgViewerProviderBase {
  container?: HTMLElement; // 预览组件挂载的节点
  imgClosable?: boolean; // 图片点击关闭，默认true
  maskClosable?: boolean; // 背景点击关闭，默认true
  toolbarRender?: (props: ToolbarProps) => ReactNode; // 工具栏渲染
  className?: string; // 容器 className
  maskClassName?: string; // 蒙层 className
  imageClassName?: string; // 图片 className
  loadingElement?: JSX.Element; // 自定义 loading Element
  brokenElement?: brokenElementType; // 图片加载失败 Element
  onScaleChange?: (scale: number) => void; // 缩放图片时的回调
  onRotateChange?: (rotate: number) => void; // 旋转图片时的回调
}

export enum ShowAnimateEnum {
  None,
  In,
  Out,
}
