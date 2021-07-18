/**
 * 获取选中框的8个点
 * @param x 左上角x坐标
 * @param y 左上角y坐标
 * @param w 选中框的宽度
 * @param h 选中框的高度
 * @returns 选中框8个点组成的数组
 */
export function getDotPosition(x: number, y: number, w: number, h: number) {
  return [
    [x - 2, y - 2, 4, 4],
    [x + w / 2 - 2, y - 2, 4, 4],
    [x + w - 2, y - 2, 4, 4],
    [x - 2, y + h / 2 - 2, 4, 4],
    [x + w - 2, y + h / 2 - 2, 4, 4],
    [x - 2, y + h - 2, 4, 4],
    [x + w / 2 - 2, y + h - 2, 4, 4],
    [x + w - 2, y + h - 2, 4, 4],
  ];
}
