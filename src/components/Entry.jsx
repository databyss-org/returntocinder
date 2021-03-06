import React from 'react';
import { Link, withRouter, matchPath } from 'react-router-dom';
import highlighter from '../lib/highlight';
import { scrollDocToElement, copyTextToClipboard } from '../lib/dom';
import { rangeOverlapExists } from '../lib/indexers';

const formatAsidePath = (pathname, mid) =>
  `${pathname.replace(/\/motif:[^/]+/, '')}/motif:${mid}`;

const parseRange = range => {
  const r = range.split('-');
  return {
    low: r[0],
    high: r.length > 1 ? r[1] : r[0],
  };
};

const sourceAndRangeMatch = ({ entry, location }) => {
  const [source, range] = location.hash.replace('#', '').split('.');
  return (
    entry.source.id === source &&
    rangeOverlapExists(parseRange(range), entry.locations)
  );
};

const getAsideMotif = location => {
  const asidePath = '(.*)/motif::term';
  const match = matchPath(location.pathname, asidePath);
  if (match) {
    return match.params.term;
  }
  return null;
};

const activeStyle = {
  backgroundColor: '#f0f0f0',
};

const copyIdToClipboard = ({ e, id }) => {
  if (copyTextToClipboard(id)) {
    e.currentTarget.style.transform = 'rotate(90deg)';
  }
};

const Entry = ({
  entry,
  content,
  showRepeats,
  highlight,
  style,
  path,
  cardinal,
  inlineHead,
  setScroll,
  location,
  isLinkedContent,
  idLinksAreActive,
  showMotifNav,
}) => {
  const eid =
    entry.locations.low === entry.locations.high
      ? `${entry.locations.low}`
      : `${entry.locations.low}-${entry.locations.high}`;
  const { hash } = location;
  const entryHash = `#${path[1]}.${eid}`;
  const isActive =
    path[0] === 'main'
      ? hash === `${entryHash}.${cardinal}`
      : sourceAndRangeMatch({ entry, location });
  const elemId = c => `${path.join('.')}.${eid}.${c}`;
  const asideMotif = isActive && getAsideMotif(location);

  return (
    <span
      style={{
        style,
        ...(isActive ? activeStyle : {}),
      }}
      id={elemId(cardinal)}
      ref={elem =>
        elem && isActive && setScroll(hash)
          ? scrollDocToElement(path[0], elem)
          : null
      }
    >
      {inlineHead}
      <p
        style={inlineHead ? { display: 'inline' } : {}}
        dangerouslySetInnerHTML={{
          __html: [
            inlineHead ? '&nbsp;' : '',
            entry.starred ? '***' : '',
            entry.locations.repeat && showRepeats ? '—— ' : entry.locations.raw,
            highlighter({
              searchWords: highlight,
              textToHighlight: content,
            }),
          ].join(''),
        }}
      />
      {idLinksAreActive && (
        <button onClick={e => copyIdToClipboard({ e, id: entry.id })}>
          👶
        </button>
      )}
      {entry.motif && showMotifNav ? (
        <nav>
          {entry.motif.map((m, idx) =>
            idx <= 4 ? (
              <Link
                key={m.id}
                dangerouslySetInnerHTML={{ __html: m.name }}
                to={`/motif/${m.id}`}
              />
            ) : null
          )}
        </nav>
      ) : null}
    </span>
  );
};

export default withRouter(Entry);
