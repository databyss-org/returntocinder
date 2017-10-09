/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import { withRouter, matchPath } from 'react-router-dom';
import styles from '../scss/modal.scss';

const transitionStyles = {
  entering: { top: '100%' },
  exiting: { top: 0 },
  exited: { top: '100%' },
  entered: { top: 0 },
};

class ModalRoute extends PureComponent {
  render() {
    const { path, component: Component, location } = this.props;
    const inProp = Boolean(matchPath(location.pathname, { path }));
    return (
      <Transition in={inProp} timeout={300}>
        {(state) => {
          return (
            <div className={styles.container} style={transitionStyles[state]}>
              <Component />
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(ModalRoute);
