import React from 'react';
import { openWidget } from '../open-widget';
import Cutting from '@/assets/icon/cutting.svg';
import { Icon } from 'antd';
import { CuttingModal } from './component/cutting-modal';
import './index.less';

export async function imageCutting() {
  const { hide } = await openWidget(
    {
      title: (
        <div className="image-cutting-title">
          <Icon className="image-cutting-title-icon" component={Cutting as any} />
          <div className="image-cutting-title-desc">图片裁剪工具</div>
        </div>
      ),
      className: 'image-cutting',
      width: 1080,
      component: CuttingModal,
      componentProps: {
        oncancel: () => hide(),
      },
      centered: true,
      closable: true,
      footer: null,
    },
    'modal'
  );
}
