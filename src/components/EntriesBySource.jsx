import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import Entries from './Entries.jsx';

const EntriesBySource = ({
  sid,
  style,
  entries,
  showHeader,
  highlight,
  path,
  setScroll,
  location,
}) =>
  <section style={style}>
    <Entries
      entries={entries}
      highlight={highlight}
      path={path.concat(sid)}
      setScroll={setScroll}
      inlineHead={showHeader ? <h3>
        <Link to={`${location.pathname}/source:${sid}`}>
          {sid}
        </Link></h3> : null
      }
    />
  </section>;

export default compose(
  withRouter,
  connect(state => state),
)(EntriesBySource);
