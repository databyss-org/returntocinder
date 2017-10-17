import React, { PureComponent } from 'react';
import { Link, withRouter, matchPath } from 'react-router-dom';
import highlighter from '../lib/highlight';
import { scrollDocToElement } from '../lib/dom';
import { rangeOverlapExists } from '../lib/indexers';

function formatAsidePath(pathname, mid) {
  return `${pathname.replace(/\/motif:[^/]+/, '')}/motif:${mid}`;
}

const activeStyle = {
  backgroundColor: '#f0f0f0'
};

class Entry extends PureComponent {
  parseRange(range) {
    const r = range.split('-');
    return {
      low: r[0],
      high: r.length > 1 ? r[1] : r[0]
    };
  }
  sourceAndRangeMatch() {
    const { entry, location } = this.props;
    const [source, range] = location.hash.replace('#', '').split('.');
    return entry.source.id === source &&
      rangeOverlapExists(this.parseRange(range), entry.locations);
  }
  getAsideMotif() {
    const asidePath = '(.*)/motif::term';
    const match = matchPath(this.props.location.pathname, asidePath);
    if (match) {
      return match.params.term;
    }
    return null;
  }
  render() {
    const {
      entry,
      showRepeats,
      highlight,
      style,
      path,
      cardinal,
      inlineHead,
      setScroll
    } = this.props;
    const eid = entry.locations.low === entry.locations.high
      ? `${entry.locations.low}`
      : `${entry.locations.low}-${entry.locations.high}`;
    const { hash } = this.props.location;
    const entryHash = `#${path[1]}.${eid}`;
    const isActive = path[0] === 'main'
      ? hash === `${entryHash}.${cardinal}`
      : this.sourceAndRangeMatch();
    const elemId = c => `${path.join('.')}.${eid}.${c}`;
    const asideMotif = isActive && this.getAsideMotif();

    return (
      <span
        style={{
          style,
          ...isActive ? activeStyle : {}
        }}
        id={elemId(cardinal)}
        ref={elem => elem && isActive && setScroll(hash)
          ? scrollDocToElement(path[0], elem)
          : null
        }
      >
        {inlineHead}
        <p
          style={inlineHead ? { display: 'inline' } : {}}
          dangerouslySetInnerHTML={{ __html: [
            inlineHead ? '&nbsp;' : '',
            entry.starred ? '***' : '',
            entry.locations.repeat && showRepeats ? '—— ' : entry.locations.raw,
            highlighter({
              searchWords: highlight,
              textToHighlight: entry.content
            })
          ].join('') }}
        />
        {entry.motif ? (
          <nav>{entry.motif.map(m =>
            <Link
              key={m.id}
              dangerouslySetInnerHTML={{ __html: m.title }}
              to={{
                pathname: formatAsidePath(this.props.location.pathname, m.id),
                hash: `${entryHash}.${cardinal}`
              }}
              style={asideMotif === m.id ? { fontWeight: 'bold' } : {}}
            />
          )}</nav>
        ) : null}
      </span>
    );
  }
}

export default withRouter(Entry);
