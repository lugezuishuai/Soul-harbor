import { HORIZONTAL_PADDING, VERTICAL_PADDING } from '../constant';
import { getViewportSize } from './get-viewport-size';

export function calcMaxZoomRatio(width: number, height: number, rotate: number, container?: HTMLElement) {
  const { width: viewportWidth, height: viewportHeight } = getViewportSize(container);
  const isVertical = rotate % 180 !== 0;
  // 旋转了奇数次
  if (isVertical) {
    [width, height] = [height, width];
  }

  return Math.min((viewportWidth - HORIZONTAL_PADDING * 2) / width, (viewportHeight - VERTICAL_PADDING * 2) / height);
}
