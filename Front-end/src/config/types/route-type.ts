import { ReactNode } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { StaticContext } from 'react-router';

export interface RouteType {
  path: string;
  component?:
    | React.ComponentType<any>
    | React.ComponentType<RouteComponentProps<any, StaticContext, unknown> & { route: RouteType }>;
  render?: (props: RouteComponentProps<{}, StaticContext, unknown> & { route: RouteType }) => React.ReactNode;
  redirect?: string;
  exact?: boolean;
  key?: string;
  strict?: boolean;
  routes?: RouteType[];
  auth?: string[];
  replaceComponent?: ReactNode;
}
