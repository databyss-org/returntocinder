import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import Entries from './Entries.jsx';

class EntriesBySource extends PureComponent {
  render() {
    const { sid, style, entries, showHeader, highlight, path } = this.props;

    return (
      <section style={style}>
        <Entries
          entries={entries}
          highlight={highlight}
          path={path.concat(sid)}
          inlineHead={showHeader ? <h3>
            <Link to={`${this.props.location.pathname}/source:${sid}`}>
              {sid}
            </Link></h3> : null
          }
        />
      </section>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), null)(EntriesBySource));
