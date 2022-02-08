export interface ViewportSize {
  width: number;
  height: number;
}

export function getViewportSize(container?: HTMLElement): ViewportSize {
  return {
    width: (container || document.documentElement).clientWidth,
    height: (container || document.documentElement).clientHeight,
  };
}
