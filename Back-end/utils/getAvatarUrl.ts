import os from 'os';
import { getIPAddress } from './getIPAddress';

export function getAvatarUrl(avatarPath: string | null) {
  const hostIP = getIPAddress(os.networkInterfaces()); // 获取主机IP地址
  const port = process.env.PORT || '4001'; // 获取当前的端口号
  const soulAvatarUrl = avatarPath ? `http://${hostIP}:${port}${avatarPath}` : null; // 真实的链接

  return soulAvatarUrl;
}
