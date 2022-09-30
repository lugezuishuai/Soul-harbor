/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const qiniu = require('qiniu');

dotenv.config({ path: '.env.development' });

const mac = new qiniu.auth.digest.Mac(process.env.CDN_ACCESS_KEY, process.env.CDN_SECRET_KEY);
const isDirectory = (source) => fs.lstatSync(source).isDirectory();

function listFile(dir, list = []) {
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

// 获取上传凭证
function getToken() {
  const putPolicy = new qiniu.rs.PutPolicy({ scope: process.env.CDN_BUCKET });
  const uploadToken = putPolicy.uploadToken(mac);
  return uploadToken;
}

function uploadFile(filePath, key) {
  const uploadToken = getToken();
  const config = new qiniu.conf.Config();
  // 空间对应的机房(华南)
  config.zone = qiniu.zone.Zone_z2;
  // 上传是否使用cdn加速
  config.useCdnDomain = true;

  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  return new Promise((resolve, reject) => {
    formUploader.putFile(uploadToken, key, filePath, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr);
      }

      if (respInfo.statusCode == 200) {
        const { key } = respBody;
        resolve(key);
      } else {
        reject(respInfo);
      }
    });
  });
}

function batchUpload() {
  const distPath = path.join(__dirname, 'dist');
  if (!isDirectory(distPath)) {
    console.error(`${distPath} is not a dir!`);
    process.exit(1);
  }

  const list = listFile(distPath);
  const uploadPromises = [];
  list.forEach((filePath) => {
    const basename = path.basename(filePath);
    if (basename === 'index.html') {
      // index.html不上传cdn
      return;
    }

    const relativePath = path.relative(distPath, filePath);
    const fileKey = `${process.env.CDN_FRONT_PREFIX}/${relativePath}`;
    const promise = uploadFile(filePath, fileKey);
    uploadPromises.push(promise);
  });

  Promise.all(uploadPromises)
    .then((value) => {
      console.log('====================================');
      console.log(value);
      console.log('====================================');
      console.log('Upload Success!!! 🎉');
    })
    .catch((e) => {
      console.error('Upload Error!!!', e);
      process.exit(1);
    });
}

batchUpload();
