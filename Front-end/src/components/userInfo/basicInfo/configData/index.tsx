import React, { useState } from 'react';
import { Form, Avatar, Input } from 'antd';
import { UserBasicInfo } from '../index';
import { inputProps } from '@/constants/inputProps';
import { FormComponentProps } from 'antd/lib/form';
import './index.less';
const { TextArea } = Input;

interface Props extends FormComponentProps {
  basicInfo: UserBasicInfo;
  edit: boolean;
}

function ConfigData(props: Props) {
  const { basicInfo, form, edit } = props;
  const { getFieldDecorator, getFieldValue } = form;
  const { nickName, PersonalSignature, avatar, birth } = basicInfo;
  return (
    <>
      <Form.Item className="config_data_item">
        <label htmlFor="avatar" className="config_data_label">头像</label>
        { avatar ? 
          <Avatar
            size={64}
            src={avatar}
            className="config_data_avatar"
          /> : <div></div>
        }
      </Form.Item>
      <Form.Item className="config_data_item">
        <label htmlFor="nickName" className="config_data_label">昵称</label>
        {edit ? (
          <div className="item_input_frame">
            {getFieldDecorator('nickName', {
              initialValue: nickName,
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入昵称'
              }]
            })(
              <Input
                {...inputProps}
                placeholder="请输入昵称"
              />
            )}
            <span style={{ display: 'block', color: '#F54A45', fontSize: 16}}>*</span>
          </div>
        ) : nickName && <span className="config_data_text">{nickName}</span>}
      </Form.Item>
      <Form.Item className="config_data_item">
        <label htmlFor="nickName" className="config_data_label">个性签名</label>
        {edit ? (
          <div>
            {getFieldDecorator('PersonalSignature', {
              initialValue: PersonalSignature,
            })(
              <TextArea
                placeholder="请输入个性签名"
                className="config_data_textarea"
                autoSize
                allowClear
              />
            )}
          </div>
        ) : PersonalSignature && <span className="config_data_text">{PersonalSignature}</span>}
      </Form.Item>
      <Form.Item className="config_data_item">
        <label htmlFor="nickName" className="config_data_label">出生年月</label>
        {edit ? (
          <div></div>
        ) : birth && <span className="config_data_text">{birth}</span>}
      </Form.Item>
    </>
  )
}

const WrapConfigData = Form.create<Props>({
  name: 'data_config'
})(ConfigData);

export default WrapConfigData;