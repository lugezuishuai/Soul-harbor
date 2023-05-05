import { matchPath } from 'react-router-dom';
import { routes } from './config';

export function findRoute(path: string) {
  return routes.find(({ path: _path, exact }) => matchPath(path, { path: _path, exact }));
}

export function hasAuthority(auth: string[], authed: string[]) {
  if (!auth.length) {
    return true;
  }

  return auth.every((item) => authed.includes(item));
}
