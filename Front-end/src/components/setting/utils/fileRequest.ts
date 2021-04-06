import Axios, { CancelTokenSource } from 'axios';
import { UPLOADCHUNK, MERGECHUNK, CHECKCHUNK } from '@/constants/urls';
import { Chunk } from '..';
import { Component } from 'react';
import { axiosList } from './common';
import { apiGet, apiPost } from '@/utils/request';
import { message } from 'antd';

const CancelToken = Axios.CancelToken;

interface FileStatus {
  fileExist: boolean; // 文件是否存在
  chunkList?: string[]; // 后端已经接收到的chunk hash值
}

// 验证已经上传了的chunks
export function checkUploadedChunks(fileName: string, fileMd5Val: string): Promise<FileStatus> {
  return new Promise((resolve, reject) => {
    apiGet(CHECKCHUNK, {
      fileName,
      fileMd5Val,
    })
    // @ts-ignore
    .then(res => resolve(res.data))
    .catch(() => {
      reject({ message: 'error' });
    });
  })
}

// 删除掉已经上传的请求
export function rmUploadedRequest(source: CancelTokenSource) {
  axiosList.forEach((item, index) => {
    if (item.token === source.token) {
      axiosList.splice(index, 1);
    }
  });
}

// 合并文件请求
export function mergeRequest(targetFile: string, fileName: string) {
  apiGet(MERGECHUNK, {
    fileHash: targetFile,
    fileName,
  })
  .then(() => message.success('merge success'))
}

export function sendRequest(
  requestList: FormData[],
  setUploadProgress: (percent: number) => void,
  uploadMaxCount = 4 // 限制最大并行上传数量
) {
  return new Promise(resolve => {
    const uploadedTotal = requestList.length;
    let sendCount = 0;
    let uploadedCount = 0;
    const sendPacks = () => {
      while (sendCount < uploadedTotal && uploadMaxCount > 0) {
        const formData = requestList[sendCount];
        uploadMaxCount--;
        sendCount++;

        const source = CancelToken.source();

        apiPost(UPLOADCHUNK, formData, { 'Content-Type': 'multipart/form-data' }, { source })
        .then(() => {
          // 已上传成功的请求的source从axiosList里面删除掉
          rmUploadedRequest(source);

          uploadMaxCount++;
          uploadedCount++;

          setUploadProgress(Math.round((uploadedCount / uploadedTotal) * 100));

          if (uploadedCount === uploadedTotal) {
            resolve(1);
          } else {
            sendPacks();
          }
        });

        axiosList.push(source);
      }
    };
    sendPacks();
  });
}

export async function uploadChunks(
  this: Component,
  chunkListInfo: Chunk[],
  uploadedList: string[],
  fileName: string,
) {
  const requestList = chunkListInfo
  .filter(({ md5AndFileNo }) => !uploadedList.includes(md5AndFileNo))
  .map(({ chunk, md5AndFileNo, fileHash }) => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('md5AndFileNo', md5AndFileNo);
    formData.append('fileName', fileName);
    formData.append('fileHash', fileHash);
    return formData;
  });

  if (requestList.length === 0) {
    mergeRequest(chunkListInfo[0].fileHash, fileName);
  } else {
    sendRequest(requestList, (percent: number) => {
      this.setState({ uploadPercent: percent });
    }).then(() => {
      if (uploadedList.length + requestList.length === chunkListInfo.length) {
        mergeRequest(chunkListInfo[0].fileHash, fileName);
      }
    })
  }
}