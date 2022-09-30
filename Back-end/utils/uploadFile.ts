import qiniu from 'qiniu';
import dotenv from 'dotenv';
import { ENV_PATH } from '../config/constant';

dotenv.config({ path: ENV_PATH });
const mac = new qiniu.auth.digest.Mac(process.env.CDN_ACCESS_KEY, process.env.CDN_SECRET_KEY);

// 获取上传凭证
function getToken() {
  const putPolicy = new qiniu.rs.PutPolicy({ scope: process.env.CDN_BUCKET });
  const uploadToken = putPolicy.uploadToken(mac);
  return uploadToken;
}

export function uploadFile(stream: NodeJS.ReadableStream, key: string) {
  const uploadToken = getToken();
  const config = new qiniu.conf.Config();
  // 空间对应的机房(华南)
  (config as any).zone = qiniu.zone.Zone_z2;
  // 上传是否使用cdn加速
  (config as any).useCdnDomain = true;

  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  return new Promise((resolve, reject) => {
    formUploader.putStream(uploadToken, key, stream, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr);
      }

      if (respInfo.statusCode == 200) {
        const { key } = respBody;
        resolve(`${process.env.CDN_DOMAIN}/${key}`);
      } else {
        reject();
      }
    });
  });
}
