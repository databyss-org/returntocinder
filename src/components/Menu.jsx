/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import styles from '../scss/menu.scss';
import { lockBodyScroll } from '../lib/dom';
import actions from '../redux/app/actions';

import data from '../../public/menu.json';

class Menu extends PureComponent {
  onTransition(isIn) {
    this.props.showMask(isIn);
    lockBodyScroll(isIn);
  }
  render() {
    const { path, location } = this.props;
    const inProp = Boolean(matchPath(location.pathname, { path }));

    return (
      <Transition
        in={inProp}
        timeout={300}
        onEntering={() => this.onTransition(true)}
        onExiting={() => this.onTransition(false)}
        appear
      >
        {(state) => {
          return (
            <div className={
              cx(styles.menu, { [styles.show]: state === 'entered' })
            }>
              {data.map((items, idx) => (
                <ul key={idx}>
                  {items.map((item, idx) => (
                    <li key={idx}>
                      <Link to={item.path}>{item.title}</Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
}), actions)(Menu));
