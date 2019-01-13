import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { EntrySource } from '@databyss-org/ui';
import actions from '../redux/app/actions';

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
  isLinked,
  showMotifNav,
  toggleSourceModal,
  history,
}) => (
  <section style={style}>
    <Entries
      isLinked={isLinked}
      entries={entries}
      highlight={highlight}
      path={path.concat(sid)}
      setScroll={setScroll}
      showRepeats
      inlineHead={
        showHeader ? (
          <EntrySource
            href={`/source/${sid}`}
            onClick={() => {
              history.push(`#source:${sid}`);
              toggleSourceModal(sid);
            }}
          >
            {sid}
          </EntrySource>
        ) : null
      }
      showMotifNav={showMotifNav}
    />
  </section>
);

export default compose(
  connect(
    state => state,
    actions
  ),
  withRouter
)(EntriesBySource);
