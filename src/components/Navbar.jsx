/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import styles from '../app.scss';
import actions from '../redux/app/actions';
import SearchIcon from '../icons/search.svg';
import DatabyssIcon from '../icons/databyss.svg';
import Search from './Search.jsx';
import Front from './Front.jsx';
import Hamburger from './Hamburger.jsx';

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
    const { location, toggleSearchIsVisible, appState } = this.props;
    const inProp = Boolean(matchPath(location.pathname, { path: '/', exact: true }));
    const hamburgerIsActive = location.hash === '#!menu';

    return [
      <Transition
        in={inProp}
        timeout={300}
      >
        {(state) => {
          return (
            <div className={cx(styles.navbar, { [styles.showFull]: state === 'entered' }) }>
              <div className={styles.bar}>
                <Hamburger
                  isActive={hamburgerIsActive}
                  onClick={() => this.onMenuClick(hamburgerIsActive)}
                />
                <div className={styles.glow} />
                <div className={styles.databyss}>
                  <DatabyssIcon />
                </div>
                <button
                  name="searchButton"
                  className={styles.searchButton}
                  onClick={() => toggleSearchIsVisible()}
                >
                  <SearchIcon />
                </button>
              </div>
              <Front />
            </div>
          );
        }}
      </Transition>,
      <div className={cx(styles.menuBar, {
        [styles.show]: appState.searchIsVisible
      })}>
        <Search
          withMenu={hamburgerIsActive || !inProp}
          withMaskClassName={this.props.withMaskClassName}
        />
        <Hamburger
          isActive={hamburgerIsActive}
          onClick={() => this.onMenuClick(hamburgerIsActive)}
        />
      </div>
    ];
  }
}

export default withRouter(connect(state => ({
  appState: state.app
}), actions)(Navbar));
