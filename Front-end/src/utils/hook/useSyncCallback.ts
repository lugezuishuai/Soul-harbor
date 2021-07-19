import { useEffect, useState, useCallback } from 'react';

/**
 * 使用useSyncCallback可以在useState改变值之后立刻获取到最新的值
 * @param callback 需要使用到state最新的值的回调函数
 * @returns 一个函数
 */
export function useSyncCallback(callback: () => any) {
  const [proxyState, setProxyState] = useState({ current: false });

  const Func = useCallback(() => {
    setProxyState({ current: true });
  }, [proxyState]);

  useEffect(() => {
    if (proxyState.current === true) setProxyState({ current: false });
  }, [proxyState]);

  useEffect(() => {
    proxyState.current && callback();
  });

  return Func;
}
