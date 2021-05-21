import { getImageInfo } from '@/utils/getImageInfo';
import { message } from 'antd';
import { RcFile } from 'antd/lib/upload';

const maxSize = 2048000; // 2m
const minWidth = 240;
const minHeight = 240;

// 校验头像
export async function verifyAvatarFile(file: RcFile) {
  // 图标大小不能超过2MB
  if (file.size > maxSize) {
    throw new Error('图标大小不能超过 2M');
  }

  const acceptType = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/bmp'];

  // 图标必须是JPEG/PNG/SVG/BMP格式
  if (!acceptType.includes(file.type)) {
    throw new Error('图标格式错误');
  }

  const { width, height } = await getImageInfo(file);

  // 图片必须大于等于240 * 240
  if (width < minWidth || height < minHeight) {
    throw new Error('图标尺寸不能小于 240*240px');
  }
}

export async function verifyAvatarFileAndMessage(file: RcFile) {
  try {
    await verifyAvatarFile(file);
  } catch (e) {
    message.error(e.message);
    throw e;
  }
}
