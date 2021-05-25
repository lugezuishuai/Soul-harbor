import os from 'os';
import { getIPAddress } from './getIPAddress';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export function getAvatarUrl(avatarPath: string | null) {
  const hostIP = process.env.SERVICE_IP || getIPAddress(os.networkInterfaces()); // 获取主机IP地址
  const port = process.env.PORT || '4001'; // 获取当前的端口号
  const soul_avatarUrl = avatarPath ? `http://${hostIP}:${port}${avatarPath}` : null; // 真实的链接

  return soul_avatarUrl;
}
