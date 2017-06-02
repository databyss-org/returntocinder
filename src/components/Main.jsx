import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import FullText from './FullText.jsx';

export default class Main extends Component {
  render() {
    return (
      <Router>
        <div>
          <h1>Baby&ndash;Daddy</h1>
          <Route exact path='/' component={FullText} />
        </div>
      </Router>
    );
  }
}
