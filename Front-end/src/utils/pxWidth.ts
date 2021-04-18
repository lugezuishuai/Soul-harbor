// 计算出传入字符串的宽度（单位：px）
export function pxWidth(str: string, font = 'normal 14px PingFang SC') {
  const canvas: HTMLCanvasElement = pxWidth.canvas ?? (pxWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  font && context && (context.font = font);
  const metrics = context && context.measureText(str);

  return metrics?.width || 0;
}
pxWidth.canvas = (null as any) as HTMLCanvasElement;
