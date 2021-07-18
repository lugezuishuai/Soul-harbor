/**
 * 返回绘制四个点和四条边的参数，提供给ctx.rect使用
 * @param x 左上角坐标
 * @param y 右上角坐标
 * @param w 鼠标在x轴方向上移动的距离
 * @param h 鼠标在y轴方向上移动的距离
 * @returns 四个点和四条边的参数组成的数组
 */
export function getMousePosition(x: number, y: number, w: number, h: number) {
  return [
    // 左上 右上 右下 左下 四个点
    [x - 4, y - 4, 8, 8],
    [x + w - 4, y - 4, 8, 8],
    [x + w - 4, y + h - 4, 8, 8],
    [x - 4, y + h - 4, 8, 8],
    // 上 右 下 左 四条边
    [x - 4, y - 4, w + 4, 8],
    [x + w - 4, y - 4, 8, h + 4],
    [x - 4, y + h - 4, w + 4, 8],
    [x - 4, y - 4, 8, h + 4],
  ];
}
