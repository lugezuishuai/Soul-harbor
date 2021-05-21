import { Component, ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

export interface ScrollToTopProps extends RouteComponentProps {
  children: ReactNode | ReactNode[];
}

class ScrollToTop extends Component<ScrollToTopProps, any> {
  componentDidUpdate(prevProps: ScrollToTopProps) {
    const { location } = this.props;
    if (location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

export const WrapScrollToTop = withRouter(ScrollToTop);
