import fs from 'fs';
import path from 'path';

export function listFile(dir: string, list: string[] = []) {
  const arr = fs.readdirSync(dir);
  arr.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      listFile(fullPath, list);
    } else {
      list.push(fullPath);
    }
  });

  return list;
}
