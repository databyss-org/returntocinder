/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import menuData from '../content/menu.json';
import styles from '../app.scss';
import actions from '../redux/app/actions';
import SearchIcon from '../icons/search.svg';
import Search from './Search.jsx';
import Hamburger from './Hamburger.jsx';

class Navbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchIsVisible: false
    };
  }
  hideMenu() {
    this.props.history.goBack();
  }
  onMenuClick(hamburgerIsActive) {
    const { hideSearch } = this.props;
    if (hamburgerIsActive) {
      this.props.history.goBack();
    } else {
      hideSearch();
      this.props.history.push('#!menu');
    }
  }
  render() {
    const { location, toggleSearchIsVisible, appState } = this.props;
    const hamburgerIsActive = location.hash === '#!menu';

    return (
      <div className={cx(styles.navbar, {
        [styles.searchFocused]: appState.searchFocused
      })}>
        <div className={styles.barContainer}>
          <div className={styles.bar}>
            <Hamburger
              isActive={hamburgerIsActive}
              onClick={() => this.onMenuClick(hamburgerIsActive)}
            />
            <Hamburger
              homeLinkOnly={true}
              isActive={hamburgerIsActive}
            />
            <ul className={styles.navLinks}>
              {menuData.map(items => items.map((item, idx) => item.header && (
                <li key={idx}>
                  <Link to={item.path}>{item.title}</Link>
                </li>
              )))}
            </ul>
            <div className={styles.searchContainer}>
              <button
                name="searchButton"
                className={styles.searchButton}
                onClick={() => {
                  hamburgerIsActive && this.hideMenu();
                  toggleSearchIsVisible();
                }}
                >
                <SearchIcon />
              </button>
              <div className={cx(styles.menuBar, {
                  [styles.show]: appState.searchIsVisible
                })}>
                <Search withMaskClassName={this.props.withMaskClassName} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app
}), actions)(Navbar));
