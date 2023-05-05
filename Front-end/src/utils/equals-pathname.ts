import { RouteComponentProps } from 'react-router-dom';

export function equalsPathname(props: RouteComponentProps<any>, prevProps: RouteComponentProps<any>) {
  const location = props.location;
  const prevLocation = prevProps.location;

  return location.pathname !== prevLocation.pathname || location.search !== prevLocation.search;
}
