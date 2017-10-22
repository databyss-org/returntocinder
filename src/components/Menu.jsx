/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import styles from '../app.scss';
import actions from '../redux/app/actions';

import menuData from '../content/menu.json';
import config from '../content/config.json';

class Menu extends PureComponent {
  onTransition(isIn) {
    this.props.showMask(isIn);
  }
  render() {
    const { location } = this.props;
    const inProp = location.hash === '#!menu';

    return (
      <Transition
        in={inProp}
        timeout={100}
        onEntering={() => this.onTransition(true)}
        onExiting={() => this.onTransition(false)}
        appear
      >
        {(state) => {
          return (
            <div className={cx(styles.menu, { [styles.show]: state === 'entered' }) }>
              <div className={styles.container}>
                <div className={styles.title}>
                  {config.title}
                </div>
                {menuData.map((items, idx) => (
                  <ul key={idx}>
                    {items.map((item, idx) => (
                      <li key={idx}>
                        <Link to={item.path} replace>{item.title}</Link>
                      </li>
                    ))}
                  </ul>
                ))}
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
}), actions)(Menu));
