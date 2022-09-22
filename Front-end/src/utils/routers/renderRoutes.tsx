import React from 'react';
import { RouteType } from '@/config/types/route-type';
import { Switch, Route, SwitchProps, Redirect } from 'react-router-dom';
import { isNullOrUndefined } from '../isNullOrUndefined';
import { hasAuthority } from './utils';

export function renderRoutes(
  routes: RouteType[] = [],
  authed: string[] = [],
  extraProps: Array<Record<string, any>> = [],
  globalRedirect?: string,
  switchProps: SwitchProps = {},
) {
  return (
    routes.length && (
      <Switch {...switchProps}>
        {routes.map((route, i) => {
          const { key, path, exact, strict, render, component: Component, auth, replaceComponent, redirect } = route;

          return (
            <Route
              key={key || i}
              path={path}
              exact={!isNullOrUndefined(exact) ? exact : true}
              strict={!isNullOrUndefined(strict) ? strict : false}
              render={(props) => {
                function renderComponent() {
                  if (render) {
                    return !isNullOrUndefined(extraProps[i])
                      ? render({ ...props, ...extraProps[i], route })
                      : render({ ...props, route });
                  } else if (Component) {
                    return !isNullOrUndefined(extraProps[i]) ? (
                      <Component {...props} {...extraProps[i]} route={route} />
                    ) : (
                      <Component {...props} route={route} />
                    );
                  } else {
                    return <Redirect to="/soul-harbor/exception/404" />;
                  }
                }

                if (redirect) {
                  return <Redirect to={redirect} />;
                } else if (auth) {
                  if (hasAuthority(auth, authed)) {
                    // 有权限
                    return renderComponent();
                  } else {
                    // 没有权限
                    return replaceComponent || <Redirect to="/soul-harbor/exception/403" />;
                  }
                } else {
                  return renderComponent();
                }
              }}
            />
          );
        })}
        <Redirect to={globalRedirect || '/soul-harbor/exception/404'} />
      </Switch>
    )
  );
}
