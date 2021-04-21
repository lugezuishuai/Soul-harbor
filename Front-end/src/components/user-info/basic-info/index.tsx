import React, { useState } from 'react';
import { message, Button, Form, Tooltip, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Rewrite from '@/assets/icon/rewrite.svg';
import { WrapConfigData } from './config-data';
import './index.less';

export interface UserBasicInfo {
  email: string;
  signature?: string | null;
  avatar?: string | null;
  birth?: string | null;
}

interface BasicInfoProps extends FormComponentProps {
  basicInfo: UserBasicInfo;
  userId: string;
}

function BasicInfo(props: BasicInfoProps) {
  const { basicInfo, userId, form } = props;
  const { validateFields } = form;
  const [edit, setEdit] = useState(false); // 基本信息编辑态
  const [loading, setLoading] = useState(false); // 保存按钮的开关状态

  function handleCancel() {
    setEdit(false);
  }

  const handleSubmit = (e: any) => {
    e.preventDefault(); // 阻止表单默认行为
    validateFields((errors: Record<string, any>, values: UserBasicInfo) => {
      if (!errors) {
        message.success('提交成功');
        setEdit(false);
      }
    });
  };

  function handleClickEdit() {
    setEdit(true);
  }

  return (
    <div className="basic-info">
      <div className="basic-info__title">
        <span className="basic-info__title__text">基本信息</span>
        {!edit && (
          <Tooltip title="编辑" placement="right">
            <Icon component={Rewrite as any} onClick={handleClickEdit} className="basic-info__title__icon" />
          </Tooltip>
        )}
      </div>
      <WrapConfigData basicInfo={basicInfo} edit={edit} userId={userId} />
      {edit && (
        <div className="basic-info__footer">
          <Button className="basic-info__footer__button" onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            className="basic-info__footer__button"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
          >
            保存
          </Button>
        </div>
      )}
    </div>
  );
}

const WrapBasicInfo = Form.create<BasicInfoProps>({
  name: 'basic-info',
})(BasicInfo);

export default WrapBasicInfo;
