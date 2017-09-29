import React, { PureComponent } from 'react';
import Highlighter from 'react-highlight-words';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Entry from './Entry.jsx';

class EntriesBySource extends PureComponent {
  render() {
    const { sid, style, entries, showHeader } = this.props;

    return (
      <section style={style}>
        {showHeader
          ? <h3>{sid}</h3>
          : null
        }
        {entries.map(entry =>
          <Entry key={entry.id} entry={entry} />
        )}
      </section>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), null)(EntriesBySource));
