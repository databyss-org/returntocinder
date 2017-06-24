import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as appActions from '../actions';
import FullText from './FullText.jsx';

class Main extends Component {
  componentDidMount() {
    this.props.fetchDoc();
  }

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

export default connect(state => ({
  appState: state
}), appActions)(Main);
