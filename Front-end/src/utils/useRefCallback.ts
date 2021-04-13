import { useRef, useCallback } from 'react';

// useRefCallback将传入的callback函数挂在ref稍后给你，方便使用ref.current
export function useRefCallback<T extends (...args: any[]) => any>(callback: T) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: any[]) => callbackRef.current(...args), []) as T;
}
