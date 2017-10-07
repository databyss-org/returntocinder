import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Front from './Front.jsx';
import Doc from './Doc.jsx';

import Search from './Search.jsx';
import loader from './Loader.jsx';

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

export default class Main extends PureComponent {
  render() {
    const WrappedSearch = loader(Search, actionQ);
    return (
      <Router>
        <div>
          <WrappedSearch />
          <Route exact path='/' component={Front} />
          <Route exact path='/doc' component={Doc} />
        </div>
      </Router>
    );
  }
}
