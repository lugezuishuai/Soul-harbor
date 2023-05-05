import React, { ComponentType, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSSRData } from './context';
import { RouteType } from '../config';

export interface BaseProps extends RouteComponentProps<any> {
  initialPropsData: any;
  loading: boolean;
}

export type IsomorphismComponent<T> = ComponentType<T> & {
  getInitialProps?: (props: any) => Promise<any>; // 客户端获取数据
  shouldUpdate?: (props: T, prevProps: T, data?: any) => boolean; // 是否需要获取数据，用于ssr后续切换路由时客户端请求数据
};

/**
 * 是否获取数据的默认判断逻辑
 * @param props 当前的props
 * @param prevProps 上一次的props
 * @param prevData 上一次的数据
 * @returns 是否需要获取数据
 */
export function shouldUpdateDefault(
  props: RouteComponentProps<any>,
  prevProps: RouteComponentProps<any>,
  prevData: any,
) {
  const location = props.location;
  const prevLocation = prevProps.location;
  return location.pathname !== prevLocation.pathname || location.search !== prevLocation.search || !prevData;
}

// 同构处理HOC
export function isomorphism<T extends BaseProps>(Component: IsomorphismComponent<T>) {
  if (Component.getInitialProps) {
    return function WrapperComponent(props: T) {
      const { initialData } = useSSRData();
      const ref = useRef(props);

      const [data, setData] = useState(initialData);
      const [loading, setLoading] = useState(!data);

      // 数据获取
      useEffect(() => {
        const needUpdate = (Component.shouldUpdate || shouldUpdateDefault)(props, ref.current, data);
        ref.current = props;

        if (needUpdate && Component.getInitialProps) {
          setLoading(true);
          Component.getInitialProps(props)
            .then((res: any) => {
              setData(res);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }, [data, props]);

      return <Component {...props} initialPropsData={data} loading={loading} />;
    };
  }

  return Component;
}

export function isomorphismRouter(routes: RouteType[]): RouteType[] {
  return routes.map((route) => {
    const { component, redirect, routes } = route;
    if (redirect) {
      return route;
    }

    if (component && routes) {
      return {
        ...route,
        component: isomorphism(component),
        routes: isomorphismRouter(routes),
      };
    } else if (component) {
      return {
        ...route,
        component: isomorphism(component),
      };
    } else {
      return route;
    }
  });
}
