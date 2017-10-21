/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { Link, withRouter, Route, matchPath } from 'react-router-dom';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import styles from '../scss/navbar.scss';
import SearchIcon from '../icons/search.svg';
import DatabyssIcon from '../icons/databyss.svg';
import Front from './Front.jsx';

class Navbar extends PureComponent {
  onMenuClick() {
    if (this.props.menuIsVisible) {
      this.props.history.goBack();
    } else {
      this.props.history.push('#!menu');
    }
  }
  render() {
    const { location } = this.props;
    const inProp = Boolean(matchPath(location.pathname, { path: '/' }));

    return (
      <Transition
        in={inProp}
        timeout={300}
      >
        {(state) => {
          return (
            <div className={cx(styles.navbar, { [styles.showFull]: state === 'entered' }) }>
              <div className={styles.bar}>
                <button
                  className={cx(styles.menuButton, styles.hamburger, styles.isActive)}
                  onClick={this.onMenuClick}
                >
                  <span className={styles.hamburgerBox}>
                    <span className={styles.hamburgerInner} />
                  </span>
                </button>
                <div className={styles.databyss}>
                  <DatabyssIcon />
                </div>
                <button name="searchButton" className={styles.searchButton}>
                  <SearchIcon />
                </button>
              </div>
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(Navbar);
