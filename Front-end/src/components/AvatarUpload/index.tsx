import React, { Component } from 'react';
import { Upload, Icon, message } from 'antd';
import style from './index.less';

function getBase64(img: File, callback: (imageUr: string | null) => void) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

function beforeUpload(file: File) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('您只能上传JPG/PNG格式的文件');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小必须小于2MB!');
  }
  return isJpgOrPng && isLt2M;
}

interface State {
  loading: boolean;
  imageUrl: string | null;
}

export default class Avatar extends Component<{}, State> {
  state: State = {
    loading: false,
    imageUrl: null
  };

  handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
        }),
      );
    }
  };

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;
    return (
      <Upload
        withCredentials             // 上传请求时是否携带cookie
        headers={{'token': 'xxx'}}  // request header
        name="avatar"
        accept='image/png, image/jpeg, image/jpg'       // 接受上传的文件类型
        listType="picture-card"     // 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card
        className={style.avatar_uploader}
        showUploadList={false}
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"     // 上传的地址
        beforeUpload={beforeUpload}       // 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
    );
  }
}