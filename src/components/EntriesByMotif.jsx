import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter, Link } from 'react-router-dom';
import actions from '../redux/app/actions';
import Entries from './Entries.jsx';

const EntriesByMotif = ({ app, mid, location, style, path, setScroll }) =>
  <article key={mid} style={style}>
    {Object.keys(app.doc[mid].sources).map((sid, sidx) => (
      <section key={mid + sid}>
        <Entries
          makeId={idx => mid + sid + idx}
          entries={app.doc[mid].sources[sid]}
          showRepeats
          path={path.concat(sid)}
          setScroll={setScroll}
          inlineHead={(
            <h3>
              <Link to={`${location.pathname}/source:${sid}`}>
                {sid}
              </Link>
            </h3>
          )}
        />
      </section>
    ))}
  </article>;

export default compose(
  withRouter,
  connect(state => state, actions)
)(EntriesByMotif);
