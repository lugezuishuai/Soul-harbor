import SparkMD5 from 'spark-md5';
import { Component } from 'react';
import { CHUNK_SIZE } from './common';

export interface FileBlob {
  file: Blob;
}

export function getFileMd5(this: Component, fileChunkList: FileBlob[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let count = 0;
    const totalCount = fileChunkList.length;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const percent = Math.round((count / totalCount) * 100);
      this.setState({ scanPercent: percent });
      if (e.target && e.target.result) {
        count++;
        spark.append(e.target.result as ArrayBuffer);
      }
      if (count < totalCount) {
        loadNext();
      } else {
        this.setState({ scanPercent: 100 });
        resolve(spark.end());
      }
    };
    fileReader.onerror = function () {
      reject({ message: 'file read error' });
    };
    function loadNext() {
      fileReader.readAsArrayBuffer(fileChunkList[count].file);
    }
    loadNext();
  });
}

export function createFileChunk(file: File): FileBlob[] {
  const fileChunkList: FileBlob[] = [];
  let start = 0;
  while (start < file.size) {
    fileChunkList.push({ file: file.slice(start, start + CHUNK_SIZE) });
    start += CHUNK_SIZE;
  }
  return fileChunkList;
}
