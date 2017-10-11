/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';

import Front from './Front.jsx';
import Doc from './Doc.jsx';
import Search from './Search.jsx';
import Source from './Source.jsx';
import ModalRoute from './ModalRoute.jsx';
import loader from './Loader.jsx';
import defer from './Defer.jsx';
import actions from '../redux/app/actions';

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

    this.Doc = defer({
      Wrapped: Doc,
      untilStatus: 'READY',
    });

    this.Source = defer({
      Wrapped: Source,
      untilStatus: 'READY',
    });
  }
  render() {
    const { appState } = this.props;
    return (
      <Router>
        <div>
          <Transition
            in={appState.showMask}
            timeout={150}
          >
            {(state) => {
              return (
                <div style={maskStyles[state]}>
                  <Route path='*' component={this.Search} />
                  <Route exact path='/' component={Front} />
                  <Route path='/(motif|source|search)/:term' component={this.Doc} />
                </div>
              );
            }}
          </Transition>
          <ModalRoute
            path='/(motif|source|search)/:term/:sid'
            component={this.Source}
            title={(props) => {
              const match = matchPath(
                props.location.pathname,
                '/(motif|source|search)/:term/:sid'
              );
              return (match && match.params.sid) || null;
            }}
          />
        </div>
      </Router>
    );
  }
}

export default connect(state => ({
  appState: state.app,
}), actions)(Main);
