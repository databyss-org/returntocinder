import React from 'react';
import { withRouter } from 'react-router-dom';
import Entries from './Entries';

const sourceLink = ({ location, history, sid }) => {
  const href = `${location.pathname}/source:${sid}`;
  return (
    <a
      href={href}
      rel="nofollow"
      onClick={(e) => {
        e.preventDefault();
        history.replace(href);
      }}
    >
      {sid}
    </a>
  );
};

const EntriesByMotif = ({
  doc,
  mid,
  location,
  history,
  style,
  path,
  setScroll,
  isLinked
}) =>
  <article key={mid} style={style}>
    {Object.keys(doc[mid].sources).map((sid, sidx) => (
      <section key={mid + sid}>
        <Entries
          makeId={idx => mid + sid + idx}
          entries={doc[mid].sources[sid]}
          showRepeats
          path={path.concat(sid)}
          setScroll={setScroll}
          inlineHead={ <h3>{sourceLink({ location, history, sid })}</h3> }
        />
      </section>
    ))}
  </article>;

export default withRouter(EntriesByMotif);
