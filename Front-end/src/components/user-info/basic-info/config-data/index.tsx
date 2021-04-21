import React from 'react';
import { Form, Avatar, Input, DatePicker } from 'antd';
import { UserBasicInfo } from '../index';
import { FormComponentProps } from 'antd/lib/form';
import dayjs from 'dayjs';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { screen } from '@/constants/screen';
import { ImageUpload } from '@/components/image-upload';
import { verifyAvatarFileAndMessage } from './verifyAvatar';
import { RcFile } from 'antd/lib/upload';
import { apiPost } from '@/utils/request';
import { UPLOADAVATAR } from '@/constants/urls';
import { UploadAvatarRes } from '@/interface/user/uploadAvatar';
import './index.less';
const { TextArea } = Input;

interface Props extends FormComponentProps {
  basicInfo: UserBasicInfo;
  userId: string;
  edit: boolean;
}

const inputProps = {
  autoComplete: 'on',
  allowClear: true,
};

function ConfigData(props: Props) {
  const { basicInfo, form, edit, userId } = props;
  const { getFieldDecorator, getFieldValue, setFields } = form;
  const { email, signature, avatar, birth } = basicInfo;

  async function checkAvatar(file: RcFile) {
    try {
      await verifyAvatarFileAndMessage(file);
      setFields({
        avatar: {
          errors: null,
        },
      });
    } catch (error) {
      setFields({
        avatar: {
          errors: [error],
        },
      });
      throw error;
    }
  }

  // 上传头像
  function handleUploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('avatar', file);
      fd.append('userId', userId);
      apiPost(UPLOADAVATAR, fd, { 'Content-type': 'multipart/form-data' })
        .then((res: UploadAvatarRes) => {
          const avatarSrc = res.data.src;
          if (avatarSrc) {
            console.log('src', avatarSrc);
            resolve(avatarSrc); // 这里后续还要改
          } else {
            reject(new Error('invalid src'));
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  // 渲染头像编辑占位
  function renderAvatar(value: string | undefined) {
    return (
      <div
        className="config-data__avatar__render"
        style={{ backgroundImage: `url(${value})`, backgroundSize: value ? 'cover' : undefined }}
      />
    );
  }

  return (
    <Form className="config-data">
      <Form.Item className="config-data__item">
        <div className="config-data__label">头像</div>
        {edit ? (
          <div className="config-data__container">
            {getFieldDecorator('avatar', {
              initialValue: avatar || defaultAvatar,
            })(<ImageUpload beforeUpload={checkAvatar} upload={handleUploadAvatar} render={renderAvatar} />)}
            <div className="config-data__hint">JPEG/PNG/SVG/BMP 格式、2M 以内、不低于 240*240px</div>
          </div>
        ) : (
          <Avatar
            className={screen.isLittleScreen ? 'config-data__avatar__small' : 'config-data__avatar'}
            src={avatar || defaultAvatar}
          />
        )}
      </Form.Item>
      <Form.Item className="config-data__item">
        <div className="config-data__label">昵称</div>
        {edit ? (
          <div className="config-data__input">
            {getFieldDecorator('email', {
              initialValue: email,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '请输入昵称',
                },
                {
                  max: 20,
                  message: '昵称不能超过20个字符',
                },
              ],
            })(<Input {...inputProps} placeholder="请输入昵称" />)}
            <div className="config-data__required">*</div>
          </div>
        ) : (
          email && <span className="config-data__text">{email}</span>
        )}
      </Form.Item>
      <Form.Item className="config-data__item">
        <div className="config-data__label">个性签名</div>
        {edit
          ? getFieldDecorator('PersonalSignature', {
              initialValue: signature,
              rules: [{ max: 100, message: '不能超过100字' }],
            })(<TextArea placeholder="请输入个性签名" className="config-data__textarea" autoSize allowClear />)
          : signature && <span className="config-data__text">{signature}</span>}
      </Form.Item>
      <Form.Item className="config-data__item">
        <div className="config-data__label">出生年月</div>
        {edit
          ? getFieldDecorator('birth', {
              initialValue: birth ? dayjs(birth) : undefined,
            })(<DatePicker placeholder="出生日期" className="config-data__datePicker" />)
          : birth && <span className="config-data__text">{birth}</span>}
      </Form.Item>
    </Form>
  );
}

export const WrapConfigData = Form.create<Props>({
  name: 'data_config',
})(ConfigData);
