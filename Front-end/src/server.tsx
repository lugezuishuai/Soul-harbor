import React from 'react';
import App from './App';
import { renderToString } from 'react-dom/server';
import { Request } from 'express';
import { matchPath } from 'react-router-dom';
import { findRoute } from './routers/utils';
import Qs from 'qs';

export async function serverRender(req: Request) {
  const canSSR = matchPath(req.path, {
    path: ['/', '/home', '/news', '/blog', '/user/:id', '/markdown', '/exception/:code'],
    exact: true,
  });

  if (!canSSR) {
    return {
      rootContent: '',
    };
  }

  const route = findRoute(req.path);
  let initialData;
  if (route?.fetch) {
    initialData = await route.fetch({
      location: { pathname: req.path, search: Qs.stringify(req.query), hash: '', state: '' },
    });
  }

  const rootContent = renderToString(<App req={req} initialData={initialData} />);
  return {
    rootContent,
  };
}
