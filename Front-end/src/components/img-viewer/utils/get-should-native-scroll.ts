import { ScrollEdgeStatus } from './get-scroll-edge-status';

export function getShouldNativeScroll(e: WheelEvent, scrollEdgeStatus: ScrollEdgeStatus): boolean {
  const { isBottomEdge, isTopEdge, isLeftEdge, isRightEdge } = scrollEdgeStatus;
  const { deltaX, deltaY } = e;

  if (deltaY !== 0) {
    // 上下滑动
    return deltaY < 0 ? isTopEdge : isBottomEdge;
  }

  if (deltaX !== 0) {
    // 左右滑动
    return deltaX < 0 ? isLeftEdge : isRightEdge;
  }

  return true;
}
