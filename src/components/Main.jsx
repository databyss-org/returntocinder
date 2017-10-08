import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Front from './Front.jsx';
import Doc from './Doc.jsx';
import Search from './Search.jsx';
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

class Main extends PureComponent {
  constructor(props) {
    super(props);

    this.WrappedSearch = loader({
      Wrapped: Search,
      queue: actionQ,
      onComplete: () => this.props.setStatus('READY')
    });

    this.WrappedDoc = defer({
      Wrapped: Doc,
      untilStatus: 'READY'
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Route path='*' component={this.WrappedSearch} />
          <Route exact path='/' component={Front} />
          <Route exact path='/doc' component={this.WrappedDoc} />
        </div>
      </Router>
    );
  }
}

export default connect(state => ({
  appState: state.app,
}), actions)(Main);
