/**
 * 获取图片合适的大小
 */
export function getSuitableImgSize(
  naturalWidth: number, // 真实宽度
  naturalHeight: number, // 真实高度
  rotate: number, // 旋转角度
  containerWidth = window.innerWidth, // 容器宽度
  containerHeight = window.innerHeight, // 容器高度
): {
  width: number;
  height: number;
} {
  let width, height;

  const isVertical = rotate % 180 !== 0;

  // 若图片不是水平则调换宽高
  if (isVertical) {
    [containerHeight, containerWidth] = [containerWidth, containerHeight];
  }

  const autoWidth = naturalWidth * (containerHeight / naturalHeight); // 自适应容器宽度
  const autoHeight = naturalHeight * (containerWidth / naturalWidth); // 自适应容器高度

  if (naturalWidth < containerWidth && naturalHeight < containerHeight) {
    // 图片宽高小于容器宽高
    width = naturalWidth;
    height = naturalHeight;
  } else if (naturalWidth < containerWidth && naturalHeight >= containerHeight) {
    // 图片宽小于容器宽，高大于等于容器高
    width = autoWidth;
    height = containerHeight;
  } else if (naturalWidth >= containerWidth && naturalHeight < containerHeight) {
    // 图片宽大于等于容器宽，高小于容器高
    width = containerWidth;
    height = autoHeight;
  } else if (naturalWidth / naturalHeight > containerWidth / containerHeight) {
    // 图片宽高大于容器宽高且图片宽高比大于容器宽高比
    width = containerWidth;
    height = autoHeight;
  } else {
    // 图片宽高大于容器宽高且图片宽高比小于容器宽高比
    width = autoWidth;
    height = containerHeight;
  }

  return {
    width,
    height,
  };
}
