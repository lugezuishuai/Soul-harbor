import React from 'react';
import { Form, Avatar, Input, DatePicker } from 'antd';
import { UserBasicInfo } from '../index';
import { inputProps } from '@/constants/inputProps';
import { FormComponentProps } from 'antd/lib/form';
import dayjs from 'dayjs';
import './index.less';
const { TextArea } = Input;

interface Props extends FormComponentProps {
  basicInfo: UserBasicInfo;
  edit: boolean;
}

const defaultAvatar = 'https://s1-fs.pstatp.com/static-resource-staging/v1/78c99186-2f3c-40aa-81b8-18591041db2g';

function ConfigData(props: Props) {
  const { basicInfo, form, edit } = props;
  const { getFieldDecorator, getFieldValue } = form;
  const { email, signature, avatar, birth } = basicInfo;
  return (
    <>
      <Form.Item className="config_data_item">
        <label htmlFor="avatar" className="config_data_label">头像</label>
        { avatar ? 
          <Avatar
            size={64}
            src={avatar || defaultAvatar}
            className="config_data_avatar"
          /> : <div></div>
        }
      </Form.Item>
      <Form.Item className="config_data_item">
        <label htmlFor="email" className="config_data_label">昵称</label>
        {edit ? (
          <div className="item_input_frame">
            {getFieldDecorator('email', {
              initialValue: email,
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入昵称'
              }, 
              { 
                max: 20,
                message: '昵称不能超过20个字符'
              }]
            })(
              <Input
                {...inputProps}
                placeholder="请输入昵称"
              />
            )}
            <span style={{ display: 'block', color: '#F54A45', fontSize: 16}}>*</span>
          </div>
        ) : email && <span className="config_data_text">{email}</span>}
      </Form.Item>
      <Form.Item className="config_data_item">
        <label htmlFor="email" className="config_data_label">个性签名</label>
        {edit ? (
          <div>
            {getFieldDecorator('PersonalSignature', {
              initialValue: signature,
              rules: [{ max: 100, message: '不能超过100字' }]
            })(
              <TextArea
                placeholder="请输入个性签名"
                className="config_data_textarea"
                autoSize
                allowClear
              />
            )}
          </div>
        ) : signature && <span className="config_data_text">{signature}</span>}
      </Form.Item>
      <Form.Item className="config_data_item">
        <label htmlFor="email" className="config_data_label">出生年月</label>
        {edit ? (
          getFieldDecorator('birth', {
            initialValue: birth ? dayjs(birth) : undefined,
          })(
            <DatePicker
              placeholder="出生日期"
              style={{ width: 200, height: 32 }}
            />
          )
        ) : birth && <span className="config_data_text">{birth}</span>}
      </Form.Item>
    </>
  )
}

const WrapConfigData = Form.create<Props>({
  name: 'data_config'
})(ConfigData);

export default WrapConfigData;