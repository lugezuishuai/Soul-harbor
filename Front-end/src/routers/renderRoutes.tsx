import React from 'react';
import { Switch, Route, SwitchProps, Redirect } from 'react-router-dom';
import { isNullOrUndefined } from '../utils/isNullOrUndefined';
import { RouteType } from './config';
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
          const { key, path, exact, strict, component: Component, auth, replaceComponent, redirect } = route;

          return (
            <Route
              key={key || i}
              path={path}
              exact={!isNullOrUndefined(exact) ? exact : true}
              strict={!isNullOrUndefined(strict) ? strict : false}
              render={(props) => {
                function renderComponent() {
                  if (Component) {
                    // @ts-ignore
                    return <Component {...props} {...extraProps?.[i]} route={route} />;
                  } else {
                    return <Redirect to="/exception/404" />;
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
                    return replaceComponent || <Redirect to="/exception/403" />;
                  }
                } else {
                  return renderComponent();
                }
              }}
            />
          );
        })}
        <Redirect to={globalRedirect || '/exception/404'} />
      </Switch>
    )
  );
}
