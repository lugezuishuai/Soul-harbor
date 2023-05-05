import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WrapLayout } from '@/pages/layout';
import { Provider } from 'react-redux';
import { getClientStore } from './redux/store';
import { SSRProvider } from './routers/ssr/context';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'lib-flexible';

export default function App() {
  return (
    <Provider store={getClientStore()}>
      <SSRProvider initialData={undefined}>
        <ConfigProvider locale={zh_CN} prefixCls="ant">
          <BrowserRouter>
            <WrapLayout />
          </BrowserRouter>
        </ConfigProvider>
      </SSRProvider>
    </Provider>
  );
}
