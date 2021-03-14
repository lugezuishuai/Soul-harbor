import React, { useState } from 'react';
import { message, Button, Form, Tooltip, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Rewrite from '@/assets/icon/rewrite.svg';
import ConfigData from './configData';
import '../index.less';
import './index.less';

export interface UserBasicInfo {
  email: string;
  signature?: string | null;
  avatar?: string | null;
  birth?: string | null;
}

interface Props extends FormComponentProps {
  basicInfo: UserBasicInfo;
  edit: boolean;
  handleEdit(edit: boolean): void;
}

function BasicInfo(props: Props) {
  const { basicInfo, edit, form, handleEdit } = props;
  const { validateFields } = form;
  const [loading, setLoading] = useState(false);          // 保存按钮的开关状态

  const handleCancel = () => {
    handleEdit(false);
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();         // 阻止表单默认行为
    validateFields((errors: Record<string, any>, values: UserBasicInfo) => {
      if(!errors) {
        message.success('提交成功');
        handleEdit(false);
      }
    });
  }

  const handleClickEdit = () => handleEdit(true);

  return (
    <div className="basic_info">
      <div className="user_info_title">
        <span className="user_info_title_text">基本信息</span>
        {!edit && <Tooltip title="编辑" placement="right">
          <Icon component={Rewrite as any} onClick={handleClickEdit} className="user_info_title_icon"/>
        </Tooltip>}
      </div>
      <Form className="user_info_form">
        <ConfigData basicInfo={basicInfo} edit={edit}/>
      </Form>
      {edit && (
        <div className="basic_info_footer">
          <Button className="basic_info_footer_button" onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            className="basic_info_footer_button"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
          >保存</Button>
        </div>
      )}
    </div>
  )
}

const WrapBasicInfo = Form.create<Props>({
  name: 'basic_info'
})(BasicInfo);

export default WrapBasicInfo;