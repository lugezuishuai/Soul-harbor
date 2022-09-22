import os from 'os';
import { getIPAddress } from './getIPAddress';
import dotenv from 'dotenv';
import { ENV_PATH, isDevelopment } from '../config/constant';
dotenv.config({ path: ENV_PATH });

export function getAvatarUrl(avatarPath: string | null) {
  const hostIP = process.env.SERVER_HOST || getIPAddress(os.networkInterfaces()); // 获取主机IP地址
  const soul_avatarUrl = avatarPath
    ? `http://${isDevelopment ? 'localhost:4001' : hostIP}/soul-harbor${avatarPath}`
    : null; // 真实的链接

  return soul_avatarUrl;
}
