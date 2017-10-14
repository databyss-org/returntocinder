import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export default function defer({ Wrapped, untilStatus }) {
  class Defer extends PureComponent {
    render() {
      if (this.props.appState.status === untilStatus) {
        return <Wrapped {...this.props} />;
      }
      return null;
    }
  }

  return withRouter(connect(state => ({
    appState: state.app,
  }), null)(Defer));
}
