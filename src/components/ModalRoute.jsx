/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import { withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import { lockBodyScroll } from '../lib/dom';
import actions from '../redux/app/actions';
import styles from '../scss/modal.scss';

const tranStyles = {
  exited: {
    container: {
      top: '100%'
    },
    mask: {
      opacity: 0
    }
  },
  entered: {
    container: {
      top: 0
    },
    mask: {
      opacity: 0.2
    }
  }
};
tranStyles.entering = tranStyles.exited;
tranStyles.exiting = tranStyles.entered;

class ModalRoute extends PureComponent {
  onTransition(isIn) {
    this.props.showMask(isIn);
    lockBodyScroll(isIn);
  }
  render() {
    const { path, component: Component, location, history } = this.props;
    const inProp = Boolean(matchPath(location.pathname, { path }));
    return (
      <Transition
        in={inProp}
        timeout={200}
        onEntering={() => this.onTransition(true)}
        onExiting={() => this.onTransition(false)}
        appear
      >
        {(state) => {
          return (
            <div
              className={styles.container}
              style={tranStyles[state].container}
              onClick={() => history.goBack()}
            >
              <div className={styles.mask} style={tranStyles[state].mask} />
              <div className={styles.content}>
                <Component />
              </div>
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
}), actions)(ModalRoute));
