import React from 'react';
import { Form, Avatar, Input, DatePicker } from 'antd';
import { UserBasicInfo } from '../index';
import { FormComponentProps } from 'antd/lib/form';
import dayjs from 'dayjs';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { screen } from '@/constants/screen';
import './index.less';
const { TextArea } = Input;

interface Props extends FormComponentProps {
  basicInfo: UserBasicInfo;
  edit: boolean;
}

const inputProps = {
  autoComplete: 'on',
  allowClear: true,
};

function ConfigData(props: Props) {
  const { basicInfo, form, edit } = props;
  const { getFieldDecorator, getFieldValue } = form;
  const { email, signature, avatar, birth } = basicInfo;
  return (
    <Form className="config-data">
      <Form.Item className="config-data__item">
        <div className="config-data__label">头像</div>
        <Avatar
          className={screen.isLittleScreen ? 'config-data__avatar__small' : 'config-data__avatar'}
          src={avatar || defaultAvatar}
        />
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

const WrapConfigData = Form.create<Props>({
  name: 'data_config',
})(ConfigData);

export default WrapConfigData;
