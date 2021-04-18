import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useWidgetManager } from './core';

function ForMount(props: { onMount: () => void }): JSX.Element {
  const { onMount } = props;
  const { widgets } = useWidgetManager();
  useEffect(() => {
    onMount();
  }, [onMount]);
  return widgets as any;
}

export function autoMount(cb: () => void) {
  const element = document.createElement('div');
  document.body.appendChild(element);
  ReactDOM.render(<ForMount onMount={cb} />, element);
}
