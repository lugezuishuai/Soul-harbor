import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.hydrate(<App />, document.querySelectorAll('.app')[0]);
