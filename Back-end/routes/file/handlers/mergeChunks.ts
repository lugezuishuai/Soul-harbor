import { Request, Response } from 'express';
import { extractExt } from '../../../utils/extractExt';
import path from 'path';
import fse from 'fs-extra';
import { UPLOAD_DIR } from '..';

// 将可写流转化成可读流
const pipeStream = (path: string, writeStream: fse.WriteStream) => {
  return new Promise((resolve) => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', (err: any) => {
      if (err) {
        throw err;
      }
      fse.unlinkSync(path);
      resolve(0);
    });
    readStream.pipe(writeStream);
  });
};

// 合并切片
const mergeFileChunk = async (filePath: string, fileHash: string, size: number) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // chunk的临时存放路径
  const chunkPaths = await fse.readdir(chunkDir); // 读取出该目录下的所有文件路径
  // 根据切片下标进行排序，否则直接读取目录获得的顺序可能会错乱
  chunkPaths.sort((a: string, b: string) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
  await Promise.all(
    chunkPaths.map((chunkPath: string, index: number) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size,
          // @ts-ignore
          end: (index + 1) * size,
        })
      )
    )
  );
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};

// 合并文件切片
export async function mergeChunks(req: Request, res: Response) {
  try {
    const { fileHash, fileName, size } = req.query;
    const ext = extractExt(fileName as string);
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
    await mergeFileChunk(filePath, fileHash as string, Number(size));

    return res.status(200).json({
      code: 0,
      data: {},
      msg: 'merge file success',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
