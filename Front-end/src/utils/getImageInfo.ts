// 获取图片信息
export function getImageInfo(
  input: File | string
): Promise<{ width: number; height: number; image: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height, image });
    };
    image.onerror = (e) => {
      reject(e);
    };
    if (typeof input !== 'string') {
      const reader = new FileReader();
      reader.onload = () => {
        image.src = reader.result as string;
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsDataURL(input);
    } else {
      image.crossOrigin = 'anonymous';
      image.src = input;
    }
  });
}
