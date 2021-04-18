import React from 'react';
import { useWidgetManager } from './core';
import { OpenDrawerFunction, OpenWidgetFunction } from './types';

export function injectOpenWidget<T>(
  Component: React.ComponentType<T & { openWidget: OpenWidgetFunction | OpenDrawerFunction }>
) {
  return function InjectedOpenWidget(props: T) {
    const { openWidget, widgets } = useWidgetManager();

    return (
      <React.Fragment>
        <Component {...props} openWidget={openWidget} />
        {widgets}
      </React.Fragment>
    );
  };
}
