import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'lib-flexible';

import App from '@/components/App';
import store from './redux/store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelectorAll('.app')[0]
);