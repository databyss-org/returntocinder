/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
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
  aboutIsVisible() {
    return this.props.location.pathname.match('about/');
  }
  onAboutClick() {
    const { location, history } = this.props;
    if (this.aboutIsVisible()) {
      history.push(location.pathname.replace(/\/about\/.+/, ''));
    } else {
      history.push(`${location.pathname === '/' ? '' : location.pathname}/about/frontis`);
    }
  }
  onMenuClick(evt) {
    this.props.toggleMenuIsVisible(!this.props.appState.menu.isVisible, evt.target);
  }
  render() {
    const { toggleSearchIsVisible, appState } = this.props;

    return (
      <div className={cx(styles.navbar, {
        [styles.searchIsFocused]: appState.search.isFocused
      })}>
        <div className={styles.barContainer}>
          <div className={styles.bar}>
            <Hamburger
              isActive={appState.menu.isVisible}
              onClick={evt => this.onMenuClick(evt)}
            />
            <Hamburger
              homeLinkOnly={true}
              isActive={appState.menu.isVisible}
            />
            <div className={styles.navLinks}>
              <Hamburger
                navLink={'About'}
                isActive={this.aboutIsVisible()}
                onClick={() => this.onAboutClick()}
              />
            </div>
            <div className={styles.searchContainer}>
              <button
                name="searchButton"
                className={styles.searchButton}
                onClick={(evt) => {
                  appState.menu.isVisible && this.hideMenu();
                  toggleSearchIsVisible(evt.target);
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
