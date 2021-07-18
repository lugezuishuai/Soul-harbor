export interface SelectPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Distance {
  x: number;
  y: number;
}

export interface GetDataOptions {
  imgSize: {
    width: number;
    height: number;
  };
  rotate: number;
  img: HTMLImageElement;
  canvasSize: {
    width: number;
    height: number;
  };
  imgScale: number;
  openGray: boolean;
  selectPosition: SelectPosition;
}
