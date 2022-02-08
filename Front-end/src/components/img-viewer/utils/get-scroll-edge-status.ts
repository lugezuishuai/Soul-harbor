export interface ScrollEdgeStatus {
  isBottomEdge: boolean;
  isTopEdge: boolean;
  isLeftEdge: boolean;
  isRightEdge: boolean;
}

/**
 * 返回图片上下左右四条边触及容器边界的状态
 * @param inner 图片Element节点
 * @param container 容器Element节点
 * @returns 图片上下左右四条边触及容器边界的状态
 */
export function getScrollEdgeStatus(inner: HTMLImageElement, container: HTMLElement): ScrollEdgeStatus {
  const { top, bottom, left, right } = inner.getBoundingClientRect();
  const { clientWidth: width, clientHeight: height } = container; // 容器视口的宽高

  return {
    isBottomEdge: height - bottom >= 0,
    isTopEdge: top >= 0,
    isLeftEdge: left >= 0,
    isRightEdge: width - right >= 0,
  };
}
