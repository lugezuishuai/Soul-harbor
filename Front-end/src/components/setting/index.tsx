import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Progress, Button, Table } from 'antd';
import { post } from '@/utils/request';
import SparkMD5 from 'spark-md5'

type Status = 'pause' | 'uploading' | 'wait' | 'finish';

interface Container {
  file: File | null;
  hash: string;
  worker: any | null;
}

interface DataSource {
  chunkHash: string;
  size: number;
  progress: number;
}

const SIZE = 10 * 1024 * 1024; // 切片大小

const transformByte = (val: number) => Number(val / 1024).toFixed(0);

export default function Setting() {
  const prefix = (str?: string) => str ? `test-upload-${str}` : 'test-upload';
  const [disabled, setDisabled] = useState(false); // 「上传」按钮的disabled
  const [status, setStatus] = useState<Status>('wait'); // 当前文件上传的状态
  const [container, setContainer] = useState<Container>({
    file: null,
    hash: '',
    worker: null,
  });
  const [data, setData] = useState<any[]>([]);
  const [requestList, setRequestList] = useState<any[]>([]);
  const [hashPercent, setHashPercent] = useState(0); // 获取文件hash的百分比
  const [fakeUploadPercent, setFakeUploadPercent] = useState(0); // 文件上传总进度的百分比
  const [dataSource, setDataSource] = useState<DataSource[]>([]); // dataSource

  // 计算真实的文件上传进度
  const uploadPercentage = useCallback(() => {
    if (!container.file || !data.length) {
      return 0;
    }
    const loaded = data.map(item => item.size * item.percentage).reduce((acc, cur) => acc + cur);
    return parseInt((loaded / container.file.size).toFixed(2));
  }, [container, data]);

  // 文件变动时的回调
  const handleFileChange = () => {
    // do something
  };

  // 处理文件上传的函数
  const handleUpload = () => {
    // do something
  }

  // 恢复上传的函数
  const handleResume = () => {
    // do something
  }

  // 暂停上传的函数
  const handlePause = () => {
    // do something
  }

  useEffect(() => {
    if (status === 'uploading' && fakeUploadPercent < uploadPercentage()) {
      // 如果当前的文件正在上传且当前的进度小于上传的进度
      setFakeUploadPercent(uploadPercentage());
    }
  }, [status, fakeUploadPercent]);

  const columns = [
    {
      title: '切片hash',
      dataIndex: 'chunkHash',
      key: 'chunkHash',
    },
    {
      title: '大小(KB)',
      dataIndex: 'size',
      key: 'size',
      render: (value: number) => transformByte(value),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (value: number) => <Progress percent={value} />
    },
  ]

  return (
    <div className={prefix()}>
      <div className={prefix('operation')}>
        <input type="file" disabled={status !== 'wait'} onChange={handleFileChange} className={prefix('upload')} />
        <Button
          type="primary"
          className={prefix('btn')}
          disabled={!container.file || status !== 'wait'}
          onClick={handleUpload}>
          上传
        </Button>
        <Button className={prefix('btn')} disabled={status !== 'pause'} onClick={handleResume}>
          恢复
        </Button>
        <Button className={prefix('btn')} disabled={status !== 'uploading' || !container.hash} onClick={handlePause}>
          暂停
        </Button>
      </div>
      <div className={prefix('percent')}>
        <div className={prefix('text')}>计算文件hash</div>
        <Progress percent={hashPercent} />
        <div className={prefix('text')}>总进度</div>
        <Progress percent={fakeUploadPercent} />
      </div>
      <Table columns={columns} dataSource={dataSource} />
    </div>
  )
}