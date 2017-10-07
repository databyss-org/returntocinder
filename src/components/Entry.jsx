import React, { PureComponent } from 'react';
import highlighter from '../lib/highlight';

export default class Entry extends PureComponent {

  render() {
    const { entry, showRepeats, highlight } = this.props;
    return (
      <span>
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
            <a
              key={m.id}
              dangerouslySetInnerHTML={{ __html: m.title }}
            />
          )}</nav>
        ) : null}
      </span>
    );
  }
}
