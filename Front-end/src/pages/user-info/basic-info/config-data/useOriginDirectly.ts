import { getImageInfo } from '@/utils/getImageInfo';
import { RcFile } from 'antd/lib/upload';

// 直接上传，不需要校验且不需要打开弹窗
export async function useOriginDirectly(file: RcFile): Promise<boolean> {
  // 图标必须是png格式
  if (file.type !== 'image/png') {
    return false;
  }

  // 图片必须小于等于100kb
  if (file.size > 100000) {
    return false;
  }

  const { width, height } = await getImageInfo(file);

  // 图片必须等于240 * 240
  if (!(width === 240 && height === 240)) {
    return false;
  }

  return true;
}
