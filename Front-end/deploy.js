/* eslint-disable @typescript-eslint/no-var-requires */
const { NodeSSH } = require('node-ssh');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config({ path: '.env.development' });
const ssh = new NodeSSH();

const host = process.env.REMOTE_HOST;
const username = process.env.REMOTE_USERNAME;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const remotePath = process.env.REMOTE_DIST_PATH;

console.log('====================================');
console.log(`服务器IP: ${host}
服务器用户: ${username}
本地ssh私钥路径: ${privateKeyPath}
服务器目录：${remotePath}`);
console.log('====================================');

ssh
  .connect({
    host,
    username,
    privateKeyPath,
  })
  .then(() => {
    const distPath = path.resolve(__dirname, './dist');

    if (!fs.existsSync(distPath)) {
      console.log('本地找不到 dist 文件夹');
      ssh.dispose();
      process.exit(1);
    }

    ssh
      .execCommand('rm -rf *', { cwd: remotePath })
      .then(() => {
        ssh
          .putDirectory(distPath, remotePath)
          .then(() => {
            console.log('dist 文件夹上传成功！');
            ssh.dispose();
            process.exit(0);
          })
          .catch((err) => {
            console.log('dist 文件夹上传失败！', err);
            ssh.dispose();
            process.exit(1);
          });
      })
      .catch((err) => {
        console.log(`${remotePath} 文件夹不存在！`, err);
        ssh.dispose();
        process.exit(1);
      });
  })
  .catch((err) => {
    console.log('服务器连接失败！', err);
    process.exit(1);
  });
