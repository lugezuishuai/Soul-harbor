import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { WrapLayout } from '@/pages/layout';

export function App() {
  return (
    <Router>
      <Route path="/*" component={WrapLayout} />
    </Router>
  );
}
