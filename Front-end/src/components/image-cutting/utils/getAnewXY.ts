import { SelectPosition } from '../type';

export function getAnewXY(select: SelectPosition): SelectPosition {
  const { x, y, w, h } = select;
  return {
    x: w < 0 ? x + w : x,
    y: h < 0 ? y + h : y,
    w: Math.abs(w),
    h: Math.abs(h),
  };
}
