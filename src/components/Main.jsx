/* eslint-disable arrow-body-style */
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import withLoader from '../hoc/withLoader';
import freezeProps from '../hoc/freezeProps';

import Navbar from './Navbar.jsx';
import Menu from './Menu.jsx';
import DocContainer from './DocContainer.jsx';
import Source from './Source.jsx';
import DocModal from './DocModal.jsx';
import ModalMenu from './ModalMenu.jsx';
import About from './About.jsx';
import Front from './Front.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import actions from '../redux/app/actions';
import SyncHistory from './SyncHistory.jsx';

import styles from '../app.scss';


const SourceModal = freezeProps({
  propsToFreeze: props => ({
    sid: props.isActive
  })
})(Source);

const Main = ({ app, maskClicked, location }) =>
  <Router>
    <SyncHistory onLocationChanged={() => maskClicked()}>
      <ScrollToTop>
        <Transition in={app.maskIsVisible} timeout={50}>
          {(state) => {
            return (
              <div
                className={cx(styles.app, {
                  [styles.showWithMask]: state === 'entered'
                })}
                onClick={evt => maskClicked(evt.target)}
              >
                <div
                  className={cx(styles.mask, {
                    [styles.show]: state === 'entering' || state === 'entered'
                  })}
                >
                  <Route
                    path="/(motif|source|search)/:term"
                    children={({ match }) =>
                      <DocContainer match={match} />
                  }/>
                </div>
                <Route path="(.*)about/:page" children={({ match }) =>
                  <ModalMenu isActive={match}>
                    <About match={match} />
                  </ModalMenu>
                }/>
                <Navbar withMaskClassName={styles.withMask} />
                <Route
                  path="(.*)/source::sid/(.*)?"
                  children={({ match, ...props }) =>
                    <DocModal isActive={Boolean(match)} {...props}>
                      <SourceModal
                        isActive={match}
                        sid={match && match.params.sid}
                      />
                    </DocModal>
                }/>
                <Front />
                <Menu />
              </div>
            );
          }}
        </Transition>
      </ScrollToTop>
    </SyncHistory>
  </Router>;

export default compose(
  connect(state => state, actions),
  withLoader({
    propsToLoad: props => ({
      biblio: props.app.biblio,
      motifs: props.app.motifList,
      authors: props.app.authorDict,
    }),
    loaderActions: props => ({
      biblio: () => props.fetchBiblio(),
      motifs: () => props.fetchMotifs(),
      authors: () => props.fetchAuthors(),
    }),
    showLoader: false
  }),
)(Main);
