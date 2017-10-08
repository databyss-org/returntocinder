import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

export default function defer({ Wrapped, untilStatus }) {
  class Defer extends PureComponent {
    render() {
      if (this.props.appState.status === untilStatus) {
        return <Wrapped />;
      }
      return null;
    }
  }

  return connect(state => ({
    appState: state.app,
  }), null)(Defer);
}
