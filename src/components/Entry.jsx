import React, { PureComponent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import highlighter from '../lib/highlight';

function formatAsidePath(pathname, mid) {
  return `${pathname.replace(/\/motif:[^/]+/, '')}/motif:${mid}`;
}

class Entry extends PureComponent {
  render() {
    const { entry, showRepeats, highlight, style } = this.props;
    return (
      <span style={style}>
        <p
          dangerouslySetInnerHTML={{ __html:
            `
            ${entry.starred ? '*** ' : ''}
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
              to={formatAsidePath(this.props.location.pathname, m.id)}
            />
          )}</nav>
        ) : null}
      </span>
    );
  }
}

export default withRouter(Entry);
