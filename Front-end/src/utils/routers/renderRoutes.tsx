import React from 'react';
import { RouteType } from '@/config/types/route-type';
import { Switch, Route, SwitchProps, Redirect } from 'react-router-dom';
import { isNullOrUndefined } from '../isNullOrUndefined';
import { hasAuthority } from './utils';

export function renderRoutes(
  routes: RouteType[],
  authed: string[] = [],
  extraProps = {},
  switchProps: SwitchProps = {}
) {
  return (
    routes && (
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
                    return render({ ...props, ...extraProps, route });
                  } else if (Component) {
                    return <Component {...props} {...extraProps} route={route} />;
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
        <Redirect to="/exception/404" />
      </Switch>
    )
  );
}
