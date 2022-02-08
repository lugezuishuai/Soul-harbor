/**
 * 判断鼠标是否在容器内部
 * @param e 鼠标事件
 * @param container 容器
 * @returns 鼠标是否在容器内不
 */
export function isMouseInContainer(e: MouseEvent, container: HTMLElement): boolean {
  const { top, right, bottom, left } = container.getBoundingClientRect();
  const { clientX, clientY } = e;

  return clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;
}
