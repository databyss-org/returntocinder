/* eslint-disable arrow-body-style */
import React from 'react';
import { BrowserRouter as Router, matchPath, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';

import Navbar from './Navbar.jsx';
import Menu from './Menu.jsx';
import DocContainer from './DocContainer.jsx';
import Source from './Source.jsx';
import ModalRoute from './ModalRoute.jsx';
import ModalMenu from './ModalMenu.jsx';
import About from './About.jsx';
import Front from './Front.jsx';
import actions from '../redux/app/actions';

import styles from '../app.scss';

const sourcePath = '(.*)/source::sid/(.*)?';
const sidFromPath = (location) => {
  const match = matchPath(location.pathname, '(.*)/source::sid/(.*)?');
  return (match && match.params.sid) || null;
};

const Main = ({ app, toggleSearchIsFocused, location }) =>
  <Router>
    <Transition in={app.showMask} timeout={50}>
      {(state) => {
        return (
          <div className={cx(styles.app, {
            [styles.showWithMask]: state === 'entered'
          })}>
            <div
              className={cx(styles.mask, {
                [styles.show]: state === 'entering' || state === 'entered'
              })}
              onClick={() => toggleSearchIsFocused(false)}
            >
              <Route path="/(motif|source|search)/:term" children={({ match }) =>
                <DocContainer match={match} />
              }/>
            </div>
            <Route path="(.*)about/:page" children={({ match }) =>
              <ModalMenu isActive={match}>
                <About match={match} />
              </ModalMenu>
            }/>
            <Navbar withMaskClassName={styles.withMask} />
            <ModalRoute
              path={sourcePath}
              component={Source}
              passProps={props => ({ sid: sidFromPath(props) })}
              title={sidFromPath}
            />
            <Front />
            <Menu />
          </div>
        );
      }}
    </Transition>
  </Router>;

export default connect(state => state, actions)(Main);
