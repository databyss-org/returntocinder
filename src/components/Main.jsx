/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';

import Navbar from './Navbar.jsx';
import Menu from './Menu.jsx';
import DocContainer from './DocContainer.jsx';
import Search from './Search.jsx';
import Source from './Source.jsx';
import ModalRoute from './ModalRoute.jsx';
import loader from './Loader.jsx';
import defer from './Defer.jsx';
import actions from '../redux/app/actions';

import styles from '../app.scss';

const actionQ = [
  [
    {
      action: props => props.fetchEntries(),
      completeWhen: props => props.appState.entryList,
      message: 'Loading entries'
    },
    {
      action: props => props.fetchBiblio(),
      completeWhen: props => props.appState.biblio,
      message: 'Loading bibliography'
    }
  ],
  [
    {
      action: props => props.fetchDoc(),
      completeWhen: props => props.appState.doc,
      message: 'Loading full index'
    },
    {
      action: props => props.indexEntries(props.appState.entryList),
      completeWhen: props => props.searchState.isIndexed,
      message: 'Indexing entries'
    }
  ]
];

const maskStyles = {
  exited: {
    filter: 'blur(0)'
  },
  entered: {
    filter: 'blur(15px)'
  }
};
maskStyles.entering = maskStyles.exited;
maskStyles.exiting = maskStyles.entered;

class Main extends PureComponent {
  constructor(props) {
    super(props);

    this.Search = loader({
      Wrapped: Search,
      queue: actionQ,
      onComplete: () => this.props.setStatus('READY')
    });

    this.DocContainer = defer({
      Wrapped: DocContainer,
      untilStatus: 'READY',
    });

    this.Source = defer({
      Wrapped: Source,
      untilStatus: 'READY',
    });
  }
  render() {
    const { appState } = this.props;
    const sourcePath = '(.*)/source::sid/(.*)?';
    const sidFromPath = (props) => {
      const match = matchPath(
        props.location.pathname,
        '(.*)/source::sid/(.*)?'
      );
      return (match && match.params.sid) || null;
    };
    return (
      <Router>
        <div className={styles.app}>
          <Transition
            in={appState.showMask}
            timeout={150}
          >
            {(state) => {
              return (
                <div className={styles.mask} style={maskStyles[state]}>
                  <this.DocContainer />
                </div>
              );
            }}
          </Transition>
          <ModalRoute
            path={sourcePath}
            component={this.Source}
            passProps={props => ({ sid: sidFromPath(props) })}
            title={sidFromPath}
          />
          <Navbar />
          <Menu path='(.*)#!menu' />
        </div>
      </Router>
    );
  }
}

export default connect(state => ({
  appState: state.app,
}), actions)(Main);
