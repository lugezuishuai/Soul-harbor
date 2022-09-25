import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from '@/pages/App';
import store from './redux/store';
import 'lib-flexible';

// 随便修改一下

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelectorAll('.app')[0]
);
