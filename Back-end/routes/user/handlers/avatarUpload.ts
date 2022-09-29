import { Request, Response } from 'express';
import path from 'path';
import fse from 'fs-extra';
import multer from 'multer';
import os from 'os';
import crypto from 'crypto';
import schedule from 'node-schedule';
import rimraf from 'rimraf';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { getIPAddress } from '../../../utils/getIPAddress';
import { extractExt } from '../../../utils/extractExt';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;
const AVATAR_PATH = path.join(__dirname, '../../../public/user/avatar');

// 头像上传
const acceptType = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/bmp'];
const avatarUploadConfig = multer({
  dest: AVATAR_PATH,
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
    if (!(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    if (!fse.existsSync(AVATAR_PATH)) {
      await fse.mkdir(AVATAR_PATH);
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
        const { userId } = req.body;
        const { mimetype, originalname, path: filePath } = file as any;
        const fileType = mimetype.split('/')[1] || extractExt(originalname); // 提取文件类型
        const hostIP = process.env.SERVER_HOST || getIPAddress(os.networkInterfaces()); // 获取主机IP地址

        const suffix = crypto.randomBytes(16).toString('hex'); // 生成16位随机的hash值作为后缀
        const tempAvatarDir = path.resolve(AVATAR_PATH, `${userId}`);
        const tempAvatarPath = path.resolve(tempAvatarDir, `${userId}-${suffix}.${fileType}`);

        if (!fse.existsSync(tempAvatarDir)) {
          await fse.mkdir(tempAvatarDir);
        }
        fse.renameSync(filePath, tempAvatarPath); // 重写头像的路径

        const avatarSrc = `http://${
          isDevelopment ? 'localhost:4001' : hostIP
        }/static/user/avatar/${userId}/${userId}-${suffix}.${fileType}`;

        schedule.scheduleJob(new Date(new Date().getTime() + 1800000), () => {
          // 临时文件夹的有效期为半个小时
          if (fse.existsSync(tempAvatarDir)) {
            rimraf(tempAvatarDir, (e) => {
              if (e) {
                isDevelopment && console.error('Error: ', e);
              }
            });
          }
        });

        return res.status(200).json({
          code: 0,
          data: {
            src: avatarSrc,
          },
          msg: 'upload success',
        });
      } catch (e: any) {
        isDevelopment && console.error('Error: ', e);
        return res.status(500).json({
          code: 1,
          data: {},
          msg: 'upload failed',
        });
      }
    });
  } catch (e: any) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: 'upload failed',
    });
  }
}
