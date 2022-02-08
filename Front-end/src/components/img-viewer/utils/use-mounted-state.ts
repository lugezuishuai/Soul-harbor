import { useCallback, useEffect, useRef } from 'react';

/**
 * 判断节点是否已经挂载的hook
 * @returns 判断节点是否已经挂载的函数
 */
export function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}
