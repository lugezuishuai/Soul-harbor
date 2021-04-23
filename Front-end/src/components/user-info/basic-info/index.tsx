import React, { useCallback, useState } from 'react';
import { Tooltip, Icon } from 'antd';
import Rewrite from '@/assets/icon/rewrite.svg';
import { WrapConfigData } from './config-data';
import './index.less';

export interface UserBasicInfo {
  signature?: string | null;
  avatar?: string | null;
  birth?: string | null;
}

interface BasicInfoProps {
  basicInfo: UserBasicInfo;
  userId: string;
}

export function BasicInfo(props: BasicInfoProps) {
  const { basicInfo, userId } = props;
  const [edit, setEdit] = useState(false); // 基本信息编辑态

  function handleClickEdit() {
    setEdit(true);
  }

  const onCancel = useCallback(() => setEdit(false), []);

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
      <WrapConfigData basicInfo={basicInfo} edit={edit} userId={userId} onCancel={onCancel} />
    </div>
  );
}
