import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import fse from 'fs-extra';
import path from 'path';
dotenv.config({ path: '.env.development' });

const sftp = new Client();

async function putEnv() {
  try {
    await sftp.connect({
      host: process.env.REMOTE_HOST,
      port: 22,
      username: process.env.REMOTE_USER,
      password: process.env.REMOTE_PASSWORD,
    });

    const targetDir = process.env.REMOTE_SOURCE_PATH;
    if (!targetDir) {
      console.error('ENV REMOTE_SOURCE_PATH not fount');
      sftp.end();
      process.exit(1);
    }

    if (!(await sftp.exists(targetDir))) {
      console.error(`${targetDir} not fount in server`);
      sftp.end();
      process.exit(1);
    }

    const envPath = path.resolve(__dirname, '.env');
    if (!fse.existsSync(envPath)) {
      console.error('.env file not found');
      sftp.end();
      process.exit(1);
    }

    await sftp.put(envPath, `${targetDir}/.env`);
    console.log('Put .env file to server success! 🎉');
    sftp.end();
  } catch (e) {
    console.error('Put .env file to server error', e);
    process.exit(1);
  }
}

putEnv();
