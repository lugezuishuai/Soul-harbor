import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Layout } from '@/pages/layout';

export function App() {
  return (
    <Router>
      <Route path="/*" component={Layout} />
    </Router>
  );
}
