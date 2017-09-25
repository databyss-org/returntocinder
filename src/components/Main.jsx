import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from '../redux/app/actions';
import Doc from './Doc.jsx';

class Main extends PureComponent {
  render() {
    return (
      <Router>
        <div>
          <Route exact path='/' component={Doc} />
        </div>
      </Router>
    );
  }
}

export default connect(state => ({
  appState: state.app
}), actions)(Main);
