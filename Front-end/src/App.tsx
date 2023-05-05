import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { WrapLayout } from '@/pages/layout';
import { Provider } from 'react-redux';
import { getServerStore } from './redux/store';
import { Ctx } from './types/ctx';
import { SSRProvider } from './routers/ssr/context';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'lib-flexible';

export default function App({ req, initialData }: Ctx) {
  return (
    <Provider store={getServerStore()}>
      <SSRProvider initialData={initialData}>
        <ConfigProvider locale={zh_CN} prefixCls="ant">
          <StaticRouter location={req?.path || '/'}>
            <WrapLayout />
          </StaticRouter>
        </ConfigProvider>
      </SSRProvider>
    </Provider>
  );
}
