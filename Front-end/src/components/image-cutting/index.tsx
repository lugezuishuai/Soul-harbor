import React from 'react';
import { openWidget } from '../open-widget';
import Cutting from '@/assets/icon/cutting.svg';
import Close from '@/assets/icon/close.svg';
import { Icon } from 'antd';
import { CuttingModal } from './content';
import './index.less';

export async function imageCutting() {
  const { hide } = await openWidget(
    {
      title: (
        <div className="image-cutting-title">
          <div className="image-cutting-title__item">
            <Icon className="image-cutting-title__cutting" component={Cutting as any} />
            <div className="image-cutting-title__desc">图片裁剪工具</div>
          </div>
          <Icon className="image-cutting-title__close" component={Close as any} onClick={() => hide()} />
        </div>
      ),
      className: 'image-cutting',
      width: 1080,
      component: CuttingModal,
      componentProps: {
        onCancel: () => hide(),
      },
      centered: true,
      closable: true,
      footer: null,
    },
    'modal'
  );
}
