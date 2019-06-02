/* eslint-disable arrow-body-style */
import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Transition from 'react-transition-group/Transition'
import cx from 'classnames'
import { Helmet } from 'react-helmet'
import withLoader from '../hoc/withLoader'
import freezeProps from '../hoc/freezeProps'

import Navbar from './Navbar.jsx'
import Menu from './Menu.jsx'
import DocContainer from './DocContainer.jsx'
import Source from './Source.jsx'
import DocModal from './DocModal.jsx'
import ModalMenu from './ModalMenu.jsx'
import Page from './Page.jsx'
import { biblioToPage } from '../lib/pages'
import Front from './Front.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import actions from '../redux/app/actions'
import SyncHistory from './SyncHistory.jsx'
import { aboutHash } from '../lib/url'

import styles from '../app.scss'

const SourceModal = freezeProps({
  propsToFreeze: props => ({
    sid: props.isActive,
  }),
})(Source)

const Main = ({ app, maskClicked, location, menu, biblio, authors }) => {
  const {
    META_TITLE,
    META_DESCRIPTION,
    META_KEYWORDS,
  } = app.config.default_meta
  return (
    <Router>
      <SyncHistory onLocationChanged={() => maskClicked()}>
        <Helmet>
          <title>{META_TITLE}</title>
          <meta name='description' content={META_DESCRIPTION} />
          <meta name='keywords' content={META_KEYWORDS} />
        </Helmet>
        <ScrollToTop>
          <Transition in={app.maskIsVisible} timeout={50}>
            {state => {
              return (
                <div
                  className={cx(styles.app, {
                    [styles.showWithMask]: state === 'entered',
                  })}
                  onClick={evt => maskClicked(evt.target)}
                >
                  <div
                    className={cx(styles.mask, {
                      [styles.show]:
                        state === 'entering' || state === 'entered',
                    })}
                  >
                    <Route
                      path='/(source|search|motif)/:term/:groupBy?/:filterBy?'
                      render={({ match }) => <DocContainer match={match} />}
                    />
                  </div>
                  <Route
                    path='/about/:page'
                    children={({ match, location }) => (
                      <ModalMenu
                        isActive={match || location.hash.match('about')}
                      >
                        <Route
                          path='/about/:page'
                          children={({ match, location }) => {
                            let aboutPath
                            let useHash = false
                            if (!match && aboutHash(location.hash)) {
                              // get about path from hash
                              aboutPath = aboutHash(location.hash)
                              useHash = true
                            } else if (match) {
                              aboutPath = match.params.page
                            } else {
                              return null
                            }
                            return (
                              <Page
                                path={`/about/${aboutPath}`}
                                subnavPath='/about'
                                contentFunc={
                                  aboutPath === 'bibliography' &&
                                  biblioToPage({ biblio, authors })
                                }
                                useHash={useHash}
                              />
                            )
                          }}
                        />
                      </ModalMenu>
                    )}
                  />
                  <Navbar withMaskClassName={styles.withMask} />
                  <DocModal isActive={app.sourceModalIsActive}>
                    <SourceModal
                      isActive={app.sourceModalIsActive}
                      sid={app.sourceModalIsActive}
                    />
                  </DocModal>
                  <Front />
                  <Menu items={menu} />
                </div>
              )
            }}
          </Transition>
        </ScrollToTop>
      </SyncHistory>
    </Router>
  )
}

export default compose(
  connect(
    state => state,
    actions
  ),
  withLoader({
    propsToLoad: props => ({
      config: props.app.config,
      biblio: props.app.biblio,
      motifs: props.app.motifList,
      authors: props.app.authorDict,
      content: props.app.pages['/'],
      menu: props.app.menus['/'],
    }),
    loaderActions: props => ({
      config: () => props.fetchConfig(),
      biblio: () => props.fetchBiblio(),
      motifs: () => props.fetchMotifs(),
      authors: () => props.fetchAuthors(),
      content: () => props.fetchPage('/'),
      menu: () => props.fetchMenu('/'),
    }),
    showLoader: false,
  })
)(Main)
