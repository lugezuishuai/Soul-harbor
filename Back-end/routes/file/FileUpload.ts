import express from 'express';
import fse from 'fs-extra';
import path from 'path';
import multiparty from 'multiparty';

const router = express.Router();
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
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // chunk的临时存放路径
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
router.get('/mergeChunks', async (req, res) => {
  const { fileHash, fileName, size } = req.query;
  const ext = extractExt(fileName as string);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  mergeFileChunk(filePath, fileHash as string, Number(size))
  .then(() => {
    res.status(200).json({
      code: 0,
      data: {},
      msg: 'merge file success',
    });
  })
  .catch(e => {
    res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  });
});

// 上传文件
router.post('/uploadChunks', async (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        code: 1,
        data: {},
        msg: err.message.toString(),
      });
    }
    const [chunk] = files.chunk;
    const [md5AndFileNo] = fields.md5AndFileNo;
    const [fileHash] = fields.fileHash;
    const [fileName] = fields.fileName;
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${extractExt(fileName)}`); // 完整文件的路径
    const chunkDir = path.resolve(UPLOAD_DIR, fileHash); // 存储chunk的临时路径-fileHash

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
        await fse.mkdirs(chunkDir);
      }

      await fse.move(chunk.path, path.resolve(chunkDir, md5AndFileNo));
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
router.get('/verifyChunks', async (req, res) => {
  const { fileHash, fileName } = req.query;
  const ext = extractExt(fileName as string); // 获取文件后缀
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  if (fse.existsSync(filePath)) {
    // 文件已经存在
    res.status(200).json({
      code: 0,
      data: {
        fileExist: true,
      },
      msg: 'file exist',
    });
  } else {
    let uploadedList: string[] = []; // 已经上传的切片hash
    try {
      uploadedList = await createUploadedList(fileHash as string); // 已经上传的chunkList
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
        fileExist: false,
        uploadedList, 
      },
      msg: 'file no exist',
    });
  }
});

export default router;