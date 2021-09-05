import { Request, Response } from 'express';
import multiparty from 'multiparty';
import path from 'path';
import fse from 'fs-extra';
import { UPLOAD_DIR } from '..';
import { extractExt } from '../../../utils/extractExt';

// 上传文件切片
export async function uploadChunks(req: Request, res: Response) {
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error: ', err);
      return res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    }

    try {
      const [chunk] = files.chunk;
      const [md5AndFileNo] = fields.md5AndFileNo;
      const [fileHash] = fields.fileHash;
      const [fileName] = fields.fileName;
      const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${extractExt(fileName)}`); // 完整文件的路径
      const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // 存储chunk的临时路径-fileHash

      // 文件存在直接返回
      if (fse.existsSync(filePath)) {
        return res.status(200).json({
          code: 0,
          data: {},
          msg: 'file exist',
        });
      }

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir);
      }

      await fse.move(chunk.path, path.resolve(chunkDir, md5AndFileNo));
      return res.status(200).json({
        code: 0,
        data: {},
        msg: 'receive file chunk',
      });
    } catch (e) {
      console.error('Error: ', e);
      return res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      });
    }
  });
}
