import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { EntrySource } from '@databyss-org/ui';
import actions from '../redux/app/actions';
import Entries from './Entries';

const EntriesByMotif = ({
  doc,
  mid,
  location,
  history,
  style,
  path,
  setScroll,
  isLinked,
  toggleSourceModal,
}) => (
  <article key={mid} style={style}>
    {Object.keys(doc[mid].sources).map((sid, sidx) => (
      <section key={mid + sid}>
        <Entries
          isLinked={isLinked}
          entries={doc[mid].sources[sid]}
          showRepeats
          path={path.concat(sid)}
          setScroll={setScroll}
          inlineHead={
            <EntrySource
              href={`/source/${sid}`}
              onClick={() => {
                history.push(`#source:${sid}`);
                toggleSourceModal(sid);
              }}
            >
              {sid}
            </EntrySource>
          }
        />
      </section>
    ))}
  </article>
);

export default compose(
  connect(
    state => state,
    actions
  ),
  withRouter
)(EntriesByMotif);
