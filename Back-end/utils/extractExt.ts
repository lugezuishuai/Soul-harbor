import path from 'path';

// 提取后缀名
export const extractExt = (filename: string) => path.extname(filename);
