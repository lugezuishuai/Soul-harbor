// 将base64文件转化为File文件
export function dataURLtoFile(dataUrl: string, filename = 'image.png'): File {
  const arr = dataUrl.split(',');
  const matched = arr[0].match(/:(.*?);/) || [];
  const mime = matched[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
