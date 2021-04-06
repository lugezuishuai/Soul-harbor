import React, { Component } from 'react';
import { Button, Progress, message, Spin } from 'antd';
import { axiosList } from './utils/common';
import { getFileMd5, createFileChunk, FileBlob } from './utils/fileProperty';
import { checkUploadedChunks, uploadChunks } from './utils/fileRequest';
import './index.less';

interface FileUploadProps {}

interface FileUploadState {
  scanPercent: number;
  uploadPercent: number;
  startScan: boolean;
}

export interface Chunk {
  chunk: Blob;
  fileHash: string;
  md5AndFileNo: string;
  percentage: number;
}

export default class FileUpload extends Component<FileUploadProps, FileUploadState> {
  constructor(props: FileUploadProps) {
    super(props);
    this.state = {
      scanPercent: 0,
      uploadPercent: 0,
      startScan: false,
    };
  }
  chunkListInfo: Chunk[] = [];
  fileName = '';
  fileMd5Value = '';
  fileChunkList: FileBlob[] = [];
  getFileMd5 = getFileMd5;
  uploadChunks = uploadChunks;

  // 判断文件是否上传完毕
  isFileUploadDone = (fileExist: boolean) => {
    if (fileExist) {
      this.setState({ uploadPercent: 100 }); // 文件秒传
      return true;
    } else {
      this.chunkListInfo = this.fileChunkList.map(({ file }, index) => ({
        fileHash: this.fileMd5Value,
        md5AndFileNo: `${this.fileMd5Value}-${index}`,
        chunk: file,
        percentage: 0,
      }));
      return false;
    }
  };

  // 开始文件上传
  startUpload = async() => {
    const uploadedFileInfo = await checkUploadedChunks(this.fileName, this.fileMd5Value); // 获取已经上传的文件信息
    if (!this.isFileUploadDone(uploadedFileInfo.fileExist) && uploadedFileInfo.chunkList) {
      // 文件还没有上传完
      this.uploadChunks(this.chunkListInfo, uploadedFileInfo.chunkList, this.fileName);
    }
  };

  // input change变化时的回调
  handleInputChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const file = target.files && target.files[0];
    if (file) {
      this.setState({ startScan: true }); // 显示扫描开始
      this.fileName = file.name; // 文件名
      this.fileChunkList = createFileChunk(file); // 将文件剪裁成若干份
      this.fileMd5Value = await this.getFileMd5(this.fileChunkList); // 获取上传文件的MD5值
      this.startUpload();
    }
  };

  // 暂停文件上传
  handlePause = () => {
    if (axiosList.length !== 0) {
      // 如果还有切片没有上传完毕
      axiosList.forEach(item => item.cancel('abort'));
      axiosList.length = 0;
      message.error('上传暂停');
    }
  };

  // 重新上传文件
  handleReuse = () => {
    this.startUpload();
  };

  render() {
    const { scanPercent, uploadPercent, startScan } = this.state;
    const scanFileDone = scanPercent === 100; // 文件扫描完成
    const uploadFileDone = uploadPercent === 100; // 文件上传完成

    return (
      <div className="file-upload">
        <div>
          <div className="file-upload__input">
            <input
              type="file"
              name="file"
              id="upload_file"
              onChange={this.handleInputChange}
            />
          </div>
          <div className="file-upload__operation">
            <Button type="primary" className="file-upload__btn" onClick={this.handlePause}>暂停上传</Button>
            <Button type="primary" className="file-upload__btn" onClick={this.handleReuse}>重新上传</Button>
          </div>
          {startScan && 
            <Spin spinning={!scanFileDone}>
              <div className={scanFileDone ? 'file-upload-text__done' : 'file-upload-text__ing'}>{scanFileDone ? '文件扫描完成' : '文件扫描中...'}</div>  
            </Spin>
          }
          {scanFileDone &&
            <Spin spinning={!uploadFileDone}>
              <div className={uploadFileDone ? 'file-upload-text__done' : 'file-upload-text__ing'}>{uploadFileDone ? '文件上传成功' : '文件上传中...'}</div>
            </Spin>
          }
          <div className="file-upload__progress">
            <div className="file-upload__progress__text">文件扫描进度</div>
            <Progress type="circle" percent={scanPercent} className="file-upload__progress__circle" />
          </div>
          <div className="file-upload__progress">
            <div className="file-upload__progress__text">文件上传进度</div>
            <Progress type="circle" percent={uploadPercent} className="file-upload__progress__circle" />
          </div>
        </div>
      </div>
    )
  }
}