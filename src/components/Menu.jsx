/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import styles from '../app.scss';
import actions from '../redux/app/actions';

class Menu extends PureComponent {
  onTransition(isIn) {
    if (!matchPath(this.props.location.pathname, '(.*)/source::sid/(.*)?')) {
      this.props.showMask(isIn);
    }
  }
  render() {
    const inProp = this.props.appState.menu.isVisible;

    const menuData = this.props.items.reduce((arr, item) => {
      arr[arr.length - 1].push(item);
      if (item.dividerAfter) {
        arr.push([]);
      }
      return arr;
    }, [[]]);

    return (
      <Transition
        in={inProp}
        timeout={250}
        onEntering={() => this.onTransition(true)}
        onExiting={() => this.onTransition(false)}
        appear
      >
        {(state) => {
          return (
            <div className={cx(styles.menu, { [styles.show]: state === 'entered' }) }>
              <div className={styles.container}>
                <Link className={styles.title} to='/'>
                  {this.props.appState.pages['/'].title}
                </Link>
                {menuData.map((items, idx) => (
                  <ul key={idx}>
                    {items.map((item, idx) => (
                      <li key={idx} onClick={() => this.props.toggleMenuIsVisible(false)}>
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
