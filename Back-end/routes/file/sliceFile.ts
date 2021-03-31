import express from 'express';
import fse from 'fs-extra';
import path from 'path';
import multiparty from 'multiparty';

const router = express.Router();
const multipart = new multiparty.Form();
const UPLOAD_DIR = path.resolve(__dirname, "../../target");
const extractExt = (filename: string) =>
  filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

// 将可写流转化成可读流
const pipeStream = (path: string, writeStream: fse.WriteStream) => {
  return new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", (err: any) => {
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
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // 保存每一个chunk的目录path
  const chunkPaths = await fse.readdir(chunkDir); // 读取出该目录下的所有文件路径
  // 根据切片下标进行排序，否则直接读取目录获得的顺序可能会错乱
  chunkPaths.sort((a: string, b: string) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
  await Promise.all(
    chunkPaths.map((chunkPath: string, index: number) => pipeStream(
      path.resolve(chunkDir, chunkPath),
      // 指定位置创建可写流
      fse.createWriteStream(filePath, {
        start: index * size,
        // @ts-ignore
        end: (index + 1) * size,
      })
    ))
  );
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};

// 返回已经上传切片名
const createUploadedList = async (fileHash: string) =>
  fse.existsSync(path.resolve(UPLOAD_DIR, fileHash))
    ? await fse.readdir(path.resolve(UPLOAD_DIR, fileHash))
    : [];


// 合并文件
router.post('/merge', async (req, res) => {
  const { fileHash, filename, size } = req.body;
  const ext = extractExt(filename);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  mergeFileChunk(filePath, fileHash, size)
  .then(() => {
    res.status(200).json({
      code: 0,
      data: {},
      msg: 'merge file success',
    });
  })
  .catch(e => {
    res.json(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  });
});

// 上传文件
router.post('/upload', async (req, res) => {
  multipart.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    }
    const { chunk, hash, fileHash, filename } = files;
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${extractExt(filename)}`); // 完整文件的路径
    const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // 每一个chunk的路径

    try {
      // 文件存在直接返回
      if (fse.existsSync(filePath)) {
        res.status(200).json({
          code: 0,
          data: {},
          msg: 'file exist',
        });
        return;
      }

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdir(chunkDir);
      }

      await fse.move(chunk.path, path.resolve(chunkDir, hash));
      res.status(200).json({
        code: 0,
        data: {},
        msg: 'receive file chunk',
      });
    } catch (e) {
      res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      });
    }
  })
});

// 验证是否已经上传切片
router.post('/verify', async (req, res) => {
  const { fileHash, filename } = req.body;
  const ext = extractExt(filename);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  if (fse.existsSync(filePath)) {
    res.status(200).json({
      code: 0,
      data: {
        shouldUpload: false,
      },
      msg: 'should upload',
    });
  } else {
    let uploadedList;
    try {
      uploadedList = await createUploadedList(fileHash); // 已经上传的chunkList
    } catch (e) {
      res.status(500).json({
        code: 1,
        data: {},
        msg: e.message.toString(),
      });
    }
    res.status(200).json({
      code: 0,
      data: {
        shouldUpload: true,
        uploadedList, 
      },
      msg: 'success',
    });
  }
});

export default router;