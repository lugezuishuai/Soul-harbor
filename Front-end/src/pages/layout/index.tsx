import React, { useCallback, useEffect } from 'react';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import { ConfigProvider } from 'antd';
import { renderRoutes } from '@/utils/routers/renderRoutes';
import { routes } from '@/config/routes';
import { apiGet } from '@/utils/request';
import { XSRFINIT } from '@/constants/urls';
import { connect } from 'react-redux';
import { SocketState, State } from '@/redux/reducers/state';
import Cookies from 'js-cookie';
import './index.less';

interface LayoutProps {
  socket: SocketState;
}

function Layout({ socket }: LayoutProps) {
  // 初始化xsrf
  const initXsrf = useCallback(async () => {
    try {
      await apiGet(XSRFINIT);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!Cookies.get('XSRF-TOKEN')) {
      initXsrf();
    }
    return () => {
      if (socket) {
        // @ts-ignore
        socket.removeAllListeners(); // 移除所有监听
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider locale={zh_CN} prefixCls="ant">
      <div className="soul-harbor__layout">{renderRoutes(routes)}</div>
    </ConfigProvider>
  );
}

export const WrapLayout = connect(({ chat: { socket } }: State) => ({
  socket,
}))(Layout);
