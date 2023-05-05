import React, { createContext, PropsWithChildren, useContext } from 'react';

export interface SSRContext {
  initialData: any; // ssr注入的初始数据
}

const ssrContext = createContext<SSRContext>({
  initialData: undefined,
});

export function SSRProvider(props: PropsWithChildren<SSRContext>) {
  const { children, initialData } = props;

  return <ssrContext.Provider value={initialData}>{children}</ssrContext.Provider>;
}

export function useSSRData() {
  return useContext(ssrContext);
}
