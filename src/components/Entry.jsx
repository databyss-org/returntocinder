import React, { PureComponent } from 'react';

export default class Entry extends PureComponent {
  render() {
    const { entry, showRepeats } = this.props;
    return (
      <p>
        <span
          dangerouslySetInnerHTML={{ __html:
            `
            ${entry.starred ? '***' : ''}
            ${entry.locations.repeat && showRepeats
              ? '—— '
              : entry.locations.raw
            }
            ${entry.content}
            `
          }}
        />
        {entry.motif ? (
          <h5>{entry.motif.map(m =>
            <a
              key={m.id}
              dangerouslySetInnerHTML={{ __html: m.title }}
            />
          )}
          </h5>
        ) : null}
      </p>
    );
  }
}
