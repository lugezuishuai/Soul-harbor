import { SelectPosition } from '../type';

/**
 * 判断选中框是否超出了边界
 * @param canvasWidth canvas容器的宽
 * @param canvasHeight canvas容器的高
 * @param select 选中框的描述信息（左上角坐标和宽高）
 */
export function checkSelectBoundary(canvasWidth: number, canvasHeight: number, select: SelectPosition) {
  // 只需要判断左上角和右下角
  const _select = { ...select };

  _select.x < 0 && (_select.x = 0);
  _select.y < 0 && (_select.y = 0);

  _select.x + _select.w > canvasWidth && (_select.x -= _select.x + _select.w - canvasWidth);
  _select.y + _select.h > canvasHeight && (_select.y -= _select.y + _select.h - canvasHeight);

  return _select;
}
