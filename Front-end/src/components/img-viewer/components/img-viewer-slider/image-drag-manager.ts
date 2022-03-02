import { LONG_PRESS_TO_DRAG_TIMEOUT, MIN_MOVE_DISTANCE } from '../../constant';

export interface OffsetPosition {
  offsetX: number;
  offsetY: number;
}

export class ImageDragManager {
  private moveImage: (position: OffsetPosition) => void;
  private position: { x: number; y: number };
  private timer: NodeJS.Timeout | null;
  private isDragging: boolean; // 按下超过一定时间或按下后移动一定距离才认为是在拖拽
  private isPointerDown: boolean;

  constructor(moveImage: (position: OffsetPosition) => void) {
    this.moveImage = moveImage;
    this.position = { x: 0, y: 0 };
    this.timer = null;
    this.isDragging = false;
    this.isPointerDown = false;
  }

  get isDraggingImage() {
    return this.isDragging;
  }

  // 按下
  pointerdown(e: PointerEvent) {
    this.isPointerDown = true;
    this.position = {
      x: e.clientX,
      y: e.clientY,
    };

    // 按下超过一定时间就认为是在拖拽，不执行click的逻辑
    this.timer = setTimeout(() => {
      this.isDragging = true;
    }, LONG_PRESS_TO_DRAG_TIMEOUT);
  }

  // 移动
  pointermove(e: PointerEvent) {
    if (!this.isPointerDown || !this.moveImage) {
      return;
    }

    const { clientX, clientY } = e;
    const { x, y } = this.position;

    // 按下之后移动一定距离就认为在拖拽
    // const moveDistance = Math.abs(clientX - x) + Math.abs(clientX - x);
    const moveDistance = Math.max(Math.abs(clientX - x), Math.abs(clientY - y)); // x轴和y轴移动距离取最大值
    if (moveDistance > MIN_MOVE_DISTANCE) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      const offsetX = clientX - x; // x轴移动的偏移量
      const offsetY = clientY - y; // y轴移动的偏移量
      this.moveImage({ offsetX, offsetY });

      // 更新位置信息
      this.position = {
        x: clientX,
        y: clientY,
      };
    }
  }

  // 松开
  pointerup() {
    this.isPointerDown = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.isDragging) {
      // mouseup 先于 click 事件，setTimeout 的目的是在 click 逻辑执行完成后再更新 isDragging 的值
      setTimeout(() => {
        this.destroy();
      }, 0);
    }
  }

  // 重置状态
  private destroy() {
    this.position = { x: 0, y: 0 };
    this.timer = null;
    this.isDragging = false;
    this.isPointerDown = false;
  }
}
