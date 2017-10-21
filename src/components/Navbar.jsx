/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { withRouter, matchPath } from 'react-router-dom';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import styles from '../app.scss';
import SearchIcon from '../icons/search.svg';
import DatabyssIcon from '../icons/databyss.svg';
import Search from './Search.jsx';

class Navbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchIsVisible: false
    };
  }
  onMenuClick(hamburgerIsActive) {
    if (hamburgerIsActive) {
      this.props.history.goBack();
    } else {
      this.props.history.push('#!menu');
    }
  }
  render() {
    const { location } = this.props;
    const inProp = Boolean(matchPath(location.pathname, { path: '/' }));
    const hamburgerIsActive = location.hash === '#!menu';

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
                  className={cx(styles.menuButton, styles.hamburger, {
                    [styles.isActive]: hamburgerIsActive,
                    [styles.showOverSearch]: this.state.searchIsVisible
                  })}
                  onClick={() => this.onMenuClick(hamburgerIsActive)}
                >
                  <span className={styles.hamburgerBox}>
                    <span className={styles.hamburgerInner} />
                  </span>
                </button>
                <div className={styles.glow} />
                <div className={styles.databyss}>
                  <DatabyssIcon />
                </div>
                <button
                  name="searchButton"
                  className={styles.searchButton}
                  onClick={() => this.setState({ searchIsVisible: true })}
                >
                  <SearchIcon />
                </button>
              </div>
              <Search
                isVisible={this.state.searchIsVisible}
                withMenu={hamburgerIsActive}
              />
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(Navbar);
