import { ZOOM_RATE } from '../constant';
import { getViewportSize } from './get-viewport-size';

export function calcBasicScale(width: number, container?: HTMLElement) {
  const { width: viewportWidth } = getViewportSize(container);
  // 宽度过小时候的匹配规则
  if (width < viewportWidth / 4) {
    return (1 + ZOOM_RATE) ** 2; // 132%
  }
  return 1;
}
