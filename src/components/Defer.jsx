import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Loader from './Loader.jsx';
import styles from '../app.scss';

export default function defer({ Wrapped, untilStatus, showLoader }) {
  class Defer extends PureComponent {
    render() {
      if (this.props.appState.status === untilStatus) {
        return <Wrapped {...this.props} />;
      }
      if (showLoader) {
        return (
          <div className={styles.defer}>
            <Loader displayOnly />
          </div>
        );
      }
      return null;
    }
  }

  return withRouter(connect(state => ({
    appState: state.app,
  }), null)(Defer));
}
