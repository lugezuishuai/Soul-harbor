import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from '@/pages/home';

const App = () => (
  <Router>
    <Route path='/*' component={Home}/>
  </Router>
)

export default App;