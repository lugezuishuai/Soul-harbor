import { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { extractExt } from '../../../utils/extractExt';
import { ENV_PATH, isDevelopment } from '../../../config/constant';
import { uploadFile } from '../../../utils/uploadFile';
import dotenv from 'dotenv';
import stream from 'stream';

dotenv.config({ path: ENV_PATH });
const { noPermission } = UnSuccessCodeType;

// 头像上传
const acceptType = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/bmp'];
const avatarUploadConfig = multer({
  limits: {
    fileSize: 2048 * 1000, // 限制文件大小（2M)
    files: 1, // 限制文件数量
  },
  fileFilter: function (req, file, cb) {
    // 限制文件上传类型，仅可上传png格式图片
    if (acceptType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Please check avatar type'));
    }
  },
});

export async function avatarUpload(req: Request, res: Response) {
  try {
    const { uuid } = req.cookies;
    // @ts-ignore
    const { token } = req.session;
    if (!isDevelopment && !(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    avatarUploadConfig.single('avatar')(req, res, async (err: any) => {
      if (err) {
        return res.status(500).json({
          code: 1,
          data: {},
          msg: err.message.toString(),
        });
      }
      try {
        const file = req.file;
        if (!file) {
          throw new Error('Can not read file');
        }

        const { userId } = req.body;
        const { mimetype, originalname, buffer } = file;

        // 生成随机文件名
        const fileType = mimetype.split('/')[1] || extractExt(originalname); // 提取文件类型
        const suffix = crypto.randomBytes(16).toString('hex'); // 生成16位随机的hash值作为后缀
        const fileKey = `${process.env.CDN_PREFIX}/${userId}/${suffix}.${fileType}`; // fileKey

        // buffer to stream
        const bufferStream = new stream.PassThrough();
        const streams = bufferStream.end(buffer);

        const result = await uploadFile(streams, fileKey);
        return res.status(200).json({
          code: 0,
          data: {
            src: result,
          },
          msg: 'upload success',
        });
      } catch (e) {
        isDevelopment && console.error('Error: ', e);
        return res.status(500).json({
          code: 1,
          data: {},
          msg: 'upload failed',
        });
      }
    });
  } catch (e) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: 'upload failed',
    });
  }
}
