import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { Spin } from 'antd';

interface WithLoginProps {
  children: ReactNode | ReactNode[];
  skipCheck?: boolean;
  noAuthPlaceholder?: ReactNode;
  login: boolean | null;
}

function WithLogin(props: WithLoginProps): JSX.Element {
  const { children, skipCheck = false, noAuthPlaceholder = null, login } = props;

  if (login !== null) {
    if (skipCheck || login) {
      return children as any;
    }
    return noAuthPlaceholder as any;
  }

  return <Spin />;
}

export default connect((state: State) => ({
  login: state.user.login,
}))(WithLogin);
