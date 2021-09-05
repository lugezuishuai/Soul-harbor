import { Request, Response } from 'express';
import { extractExt } from '../../../utils/extractExt';
import path from 'path';
import fse from 'fs-extra';
import { UPLOAD_DIR } from '..';

// 返回已经上传切片名
const createUploadedList = async (fileHash: string) =>
  fse.existsSync(path.resolve(UPLOAD_DIR, fileHash)) ? await fse.readdir(path.resolve(UPLOAD_DIR, fileHash)) : [];

// 验证是否已经上传切片
export async function verifyChunks(req: Request, res: Response) {
  try {
    const { fileHash, fileName } = req.query;
    const ext = extractExt(fileName as string); // 获取文件后缀
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
    if (fse.existsSync(filePath)) {
      // 文件已经存在
      return res.status(200).json({
        code: 0,
        data: {
          fileExist: true,
        },
        msg: 'file exist',
      });
    } else {
      const uploadedList = await createUploadedList(fileHash as string); // 已经上传的chunkList
      return res.status(200).json({
        code: 0,
        data: {
          fileExist: false,
          uploadedList,
        },
        msg: 'file no exist',
      });
    }
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
