import Axios, { CancelTokenSource } from 'axios';
import { UPLOADCHUNK, MERGECHUNK, CHECKCHUNK } from '@/constants/urls';
import { Chunk } from '..';
import { Component } from 'react';
import { axiosList, CHUNK_SIZE } from './common';
import { apiGet, apiPost } from '@/utils/request';
import { message } from 'antd';

const CancelToken = Axios.CancelToken;

interface FileStatus {
  fileExist: boolean; // 文件是否存在
  uploadedList?: string[]; // 后端已经接收到的chunk hash值
}

// 验证已经上传了的chunks
export function checkUploadedChunks(fileName: string, fileMd5Val: string): Promise<FileStatus> {
  return new Promise((resolve, reject) => {
    apiGet(CHECKCHUNK, {
      fileName, // 文件名
      fileHash: fileMd5Val, // 文件hash
    })
      .then((res) => resolve(res.data))
      .catch(() => {
        reject({ message: 'error' });
      });
  });
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
export async function mergeRequest(targetFile: string, fileName: string) {
  try {
    await apiGet(MERGECHUNK, {
      fileHash: targetFile,
      fileName,
      size: CHUNK_SIZE,
    });
    message.success('merge success');
  } catch (e) {
    console.error(e);
  }
}

// 发送上传切片请求
export function sendRequest(
  requestList: FormData[],
  setUploadProgress: (percent: number) => void,
  uploadMaxCount = 4 // 限制最大并行上传切片数量
) {
  return new Promise((resolve, reject) => {
    const needUploadTotal = requestList.length; // 还需要上传的切片总数
    let sendCount = 0; // 索引
    let uploadedCount = 0; // 已经完成上传的数量
    const sendPacks = () => {
      while (sendCount < needUploadTotal && uploadMaxCount > 0) {
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

            setUploadProgress(Math.round((uploadedCount / needUploadTotal) * 100));

            if (uploadedCount === needUploadTotal) {
              resolve(1);
            } else {
              sendPacks();
            }
          })
          .catch((e) => reject(e));

        axiosList.push(source);
      }
    };
    sendPacks();
  });
}

export async function uploadChunks(
  this: Component,
  chunkListInfo: Chunk[], // 所有的文件切片信息
  uploadedList: string[], // 已经上传的文件hash数组
  fileName: string
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
    }); // 此次还需要上传的formData数组

  if (requestList.length === 0) {
    // 已经上传完所有的切片，直接合并文件
    mergeRequest(chunkListInfo[0].fileHash, fileName);
  } else {
    sendRequest(requestList, (percent: number) => {
      this.setState({ uploadPercent: percent });
    })
      .then(() => {
        if (uploadedList.length + requestList.length === chunkListInfo.length) {
          mergeRequest(chunkListInfo[0].fileHash, fileName);
        }
      })
      .catch((e) => console.error(e));
  }
}
