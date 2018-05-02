import React from 'react';
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
  isLinked
}) =>
  <section style={style}>
    <Entries
      isLinked={isLinked}
      entries={entries}
      highlight={highlight}
      path={path.concat(sid)}
      setScroll={setScroll}
      showRepeats
      inlineHead={showHeader ? <h3>
        <Link to={`${location.pathname}/source:${sid}`}>
          {sid}
        </Link></h3> : null
      }
    />
  </section>;

export default withRouter(EntriesBySource);
