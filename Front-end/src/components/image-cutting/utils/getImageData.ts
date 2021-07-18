import { GetDataOptions } from './../type';
import { getGrayScaleData } from './getGrayScaleData';

/**
 *
 * @param param0 选中的图片的信息
 * @returns 选择框中图片的base64
 */
export function getImageData({ imgSize, rotate, img, canvasSize, imgScale, selectPosition, openGray }: GetDataOptions) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  let { width: imgWidth, height: imgHeight } = imgSize;

  if (rotate % 180 !== 0) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }

  canvas.width = imgWidth;
  canvas.height = imgHeight;

  ctx.save(); // 将canvas当前的状态放入栈中保存
  ctx.translate(imgWidth / 2, imgHeight / 2);
  ctx.rotate((Math.PI / 180) * rotate);

  if (rotate % 180 !== 0) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }

  ctx.translate(-imgWidth / 2, -imgHeight / 2);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  ctx.restore();

  const { width: canvasWidth, height: canvasHeight } = canvasSize;

  if (rotate % 180 !== 0) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }

  const putX = (imgWidth - canvasWidth / imgScale) / 2 + selectPosition.x / imgScale;
  const putY = (imgHeight - canvasHeight / imgScale) / 2 + selectPosition.y / imgScale;
  const putW = selectPosition.w / imgScale;
  const putH = selectPosition.h / imgScale;

  if (!putW || !putH) {
    return '';
  }

  const imgData = ctx.getImageData(putX, putY, putW, putH);

  if (openGray) {
    getGrayScaleData(imgData);
  }

  canvas.width = putW;
  canvas.height = putH;

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((e) => resolve(e));
  });
}
