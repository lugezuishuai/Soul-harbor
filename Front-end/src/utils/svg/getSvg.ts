export async function getSvg(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow',
    referrer: 'no-referrer',
  });
  const svg = await res.text();
  return svg;
}

export function getSvgBase64(url: string) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('url must be a string'));
    }
    const image = new Image();
    image.onload = () => {
      const canvas: HTMLCanvasElement = getSvgBase64.canvas ?? (getSvgBase64.canvas = document.createElement('canvas'));
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context && context.drawImage(image, 0, 0, image.width, image.height);
      const dataURL = canvas.toDataURL(); // 得到图片的base64编码数据
      resolve(dataURL);
    };
    image.onerror = (e) => {
      reject(e);
    };
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}
getSvgBase64.canvas = null as any as HTMLCanvasElement;
