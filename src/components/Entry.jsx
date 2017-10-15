import React, { PureComponent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import highlighter from '../lib/highlight';
import { scrollDocToElement } from '../lib/dom';

function formatAsidePath(pathname, mid) {
  return `${pathname.replace(/\/motif:[^/]+/, '')}/motif:${mid}`;
}

const activeStyle = {
  backgroundColor: '#f0f0f0'
};

class Entry extends PureComponent {
  render() {
    const {
      entry,
      showRepeats,
      highlight,
      style,
      path,
      cardinal,
      inlineHead,
    } = this.props;
    const eid = `${entry.locations.low}`;
    const { hash } = this.props.location;
    const entryHash = `#${path[1]}.${eid}`;
    const isActive = path[0] === 'main'
      ? hash === `${entryHash}.${cardinal}`
      : hash.startsWith(entryHash);
    const elemId = c => `${path.join('.')}.${eid}.${c}`;

    return (
      <span
        style={{
          style,
          ...isActive ? activeStyle : {}
        }}
        id={elemId(cardinal)}
        ref={elem => isActive ? scrollDocToElement(path[0], elem) : null}
      >
        {inlineHead}
        <p
          style={inlineHead ? { display: 'inline' } : {}}
          dangerouslySetInnerHTML={{ __html:
            `
            ${entry.starred ? '***' : ''}
            ${entry.locations.repeat && showRepeats
              ? '—— '
              : entry.locations.raw
            }
            ${highlighter({
              searchWords: highlight,
              textToHighlight: entry.content
            })}
            `
          }}
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
            />
          )}</nav>
        ) : null}
      </span>
    );
  }
}

export default withRouter(Entry);
