import React from 'react';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import { ConfigProvider } from 'antd';
import { renderRoutes } from '@/utils/routers/renderRoutes';
import { routes } from '@/config/routes';
import './index.less';

export function Layout() {
  return (
    <ConfigProvider locale={zh_CN} prefixCls="ant">
      <div className="soul-harbor__layout">{renderRoutes(routes)}</div>
    </ConfigProvider>
  );
}
