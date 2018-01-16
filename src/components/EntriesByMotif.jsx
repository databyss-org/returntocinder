import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import Entries from './Entries';

const EntriesByMotif = ({ doc, mid, location, style, path, setScroll }) =>
  <article key={mid} style={style}>
    {Object.keys(doc[mid].sources).map((sid, sidx) => (
      <section key={mid + sid}>
        <Entries
          makeId={idx => mid + sid + idx}
          entries={doc[mid].sources[sid]}
          showRepeats
          path={path.concat(sid)}
          setScroll={setScroll}
          inlineHead={(
            <h3>
              <Link to={`${location.pathname}/source:${sid}`} replace>
                {sid}
              </Link>
            </h3>
          )}
        />
      </section>
    ))}
  </article>;

export default withRouter(EntriesByMotif);
