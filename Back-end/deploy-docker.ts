import path from 'path';
import { NodeSSH } from 'node-ssh';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const ssh = new NodeSSH();

const host = process.env.REMOTE_HOST;
const username = process.env.REMOTE_USER;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const remotePath = process.env.REMOTE_SOURCE_PATH_DOCKER;
const dockerComposePath = process.env.DOCKER_COMPOSE_PATH;

console.log('====================================');
console.log(`服务器IP: ${host}
服务器用户: ${username}
本地ssh私钥路径: ${privateKeyPath}
服务器目录: ${remotePath}
docker-compose配置文件路径: ${dockerComposePath}`);
console.log('====================================');

if (!host || !username || !privateKeyPath || !remotePath || !dockerComposePath) {
  console.log('上述信息有误，请在.env文件中添加');
  process.exit(1);
}

ssh
  .connect({
    host,
    username,
    privateKeyPath,
  })
  .then(() => {
    ssh
      .execCommand('rm -rf *', { cwd: remotePath })
      .then(() => {
        ssh
          .putDirectory(__dirname, remotePath, {
            validate: function (itemPath) {
              const baseName = path.basename(itemPath);
              return (
                baseName !== 'dist' &&
                baseName !== 'logs' &&
                baseName !== 'node_modules' &&
                baseName !== '.DS_Store' &&
                baseName !== 'public' &&
                !/^\.env.*/.test(baseName) &&
                !/^deploy.*/.test(baseName)
              );
            },
          })
          .then(() => {
            console.log('文件上传成功！');
            console.log();
            // 重新构建soul-harbor镜像并且重启服务 && 删除无用的<none>:<none>镜像
            ssh
              .execCommand('docker-compose up -d --build soul-harbor && docker image prune -f', {
                cwd: dockerComposePath,
              })
              .then((res) => {
                const { stdout, stderr } = res;

                if (stderr) {
                  console.log('部署失败！', stderr);
                  ssh.dispose();
                  process.exit(1);
                }

                console.log(stdout);
                console.log();
                console.log('部署成功！');
                ssh.dispose();
                process.exit(0);
              })
              .catch((err) => {
                console.log('部署失败！', err);
                ssh.dispose();
                process.exit(1);
              });
          })
          .catch((err) => {
            console.log('文件上传失败！', err);
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
