export function getGrayScaleData(imgData: ImageData) {
  const data = imgData.data; // 一个包含RGBA数据的数组
  for (let i = 0; i < data.length; i += 4) {
    const grayScale = (data[i] + data[i + 1] + data[i + 2]) >> 2;
    data[i] = grayScale;
    data[i + 1] = grayScale;
    data[i + 2] = grayScale;
  }

  return data;
}
