import os from 'os';

//获取本机ip地址
export function getIPAddress(interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>) {
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; iface && i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}
