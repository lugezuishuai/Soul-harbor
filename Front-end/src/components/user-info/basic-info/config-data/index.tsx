import React, { useState } from 'react';
import { Form, Avatar, Input, DatePicker, Button } from 'antd';
import { UserBasicInfo } from '../index';
import { FormComponentProps } from 'antd/lib/form';
import dayjs, { Dayjs } from 'dayjs';
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

interface ConfigDataProps extends FormComponentProps {
  basicInfo: UserBasicInfo;
  userId: string;
  edit: boolean;
  onCancel(): void;
}

interface FormValues {
  avatar: string;
  signature: string | null;
  birth?: Dayjs;
}

function ConfigData(props: ConfigDataProps) {
  const { basicInfo, form, edit, userId, onCancel } = props;
  const { getFieldDecorator, validateFields, setFields } = form;
  const { signature, avatar, birth } = basicInfo;
  const [loading, setLoading] = useState(false); // 保存按钮的开关状态

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
            resolve(avatarSrc);
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

  function handleSubmit(e: any) {
    e.preventDefault(); // 阻止表单默认行为
    validateFields((errors: Record<string, any>, values: FormValues) => {
      if (!errors) {
        setLoading(true);
        try {
          const { avatar, signature, birth } = values;
          onCancel();
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  return (
    <>
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
          <div className="config-data__label">个性签名</div>
          {edit
            ? getFieldDecorator('signature', {
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
      {edit && (
        <div className="config-data__footer">
          <Button className="config-data__footer__button" onClick={onCancel}>
            取消
          </Button>
          <Button
            type="primary"
            className="config-data__footer__button"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
          >
            保存
          </Button>
        </div>
      )}
    </>
  );
}

export const WrapConfigData = Form.create<ConfigDataProps>({
  name: 'data_config',
})(ConfigData);
