/**
 * 获取选中框的虚线
 * @param x 左上角x坐标
 * @param y 左上角y坐标
 * @param w 选中框的宽度
 * @param h 选中框的高度
 * @returns 选中框四条虚线的位置信息
 */
export function getDashPosition(x: number, y: number, w: number, h: number) {
  return [
    [x, y + h / 3, x + w, y + h / 3],
    [x, y + (2 * h) / 3, x + w, y + (2 * h) / 3],
    [x + w / 3, y, x + w / 3, y + h],
    [x + (2 * w) / 3, y, x + (2 * w) / 3, y + h],
  ];
}
