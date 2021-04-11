import { ReactNode } from 'react';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';

export interface WithLoginProps {
  children: ReactNode | ReactNode[];
  skipCheck?: boolean;
  noLoginPlaceholder?: ReactNode;
  loadingComponent?: ReactNode;
  login: boolean | null;
}

function WithLogin(props: WithLoginProps): JSX.Element {
  const { children, skipCheck = false, noLoginPlaceholder = null, login, loadingComponent } = props;

  if (login !== null) {
    if (skipCheck || login) {
      return children as any;
    }
    return noLoginPlaceholder as any;
  }

  if (loadingComponent) {
    return loadingComponent as any;
  }

  return null as any;
}

export const WrapWithLogin = connect((state: State) => ({
  login: state.user.login,
}))(WithLogin);
