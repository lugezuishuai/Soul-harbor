/**
 * 最小缩放度
 */
export const MIN_ZOOM_RATE = 0.1;

/**
 * 最大缩放度
 */
export const MAX_ZOOM_RATE = 5;

/**
 * 固定缩放度
 */
export const ZOOM_RATE = 0.15;

/**
 * 滚动速度
 */
export const WHEEL_SCROLL_SPEED_FACTOR = 3;

/**
 * 节流时间
 */
export const THROTTLE_SCROLL_TIMEOUT = 50;

/**
 * 防抖时间
 */
export const DEBOUNCE_TIMEOUT = 50;

/**
 * 长按拖拽时间
 */
export const LONG_PRESS_TO_DRAG_TIMEOUT = 300;

/**
 * 最小移动距离
 */
export const MIN_MOVE_DISTANCE = 10;

export const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const WINDOW = IS_BROWSER ? window : {};
export const HAS_POINTER_EVENT = IS_BROWSER ? 'PointerEvent' in WINDOW : false;
export const IS_TOUCH_DEVICE =
  IS_BROWSER && window.document.documentElement ? 'ontouchstart' in window.document.documentElement : false;
export const EVENT_TOUCH_END = IS_TOUCH_DEVICE ? 'touchend touchcancel' : 'mouseup';
export const EVENT_TOUCH_MOVE = IS_TOUCH_DEVICE ? 'touchmove' : 'mousemove';
export const EVENT_TOUCH_START = IS_TOUCH_DEVICE ? 'touchstart' : 'mousedown';
export const EVENT_POINTER_DOWN = HAS_POINTER_EVENT ? 'pointerdown' : EVENT_TOUCH_START;
export const EVENT_POINTER_MOVE = HAS_POINTER_EVENT ? 'pointermove' : EVENT_TOUCH_MOVE;
export const EVENT_POINTER_UP = HAS_POINTER_EVENT ? 'pointerup' : EVENT_TOUCH_END;
export const EVENT_RESIZE = 'resize';
export const EVENT_CLICK = 'click';
export const EVENT_WHEEL = 'wheel';
export const HORIZONTAL_PADDING = 40;
export const VERTICAL_PADDING = 40;
