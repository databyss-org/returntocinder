import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import qs from 'query-string';
import { withRouter } from 'react-router-dom';

class Motif extends PureComponent {
  render() {
    const { motif, style } = this.props;
    const { doc, entries } = this.props.appState;
    const query = qs.parse(this.props.location.search);
    const sources = query.source
      ? Object.keys(doc[motif].sources).reduce((sourceList, sid) =>
        sid.replace(/\([A-Z]+\)/, '').trim() === query.source
          ? sourceList.concat(sid)
          : sourceList
        , [])
      : Object.keys(doc[motif].sources);

    return (
      <chapter key={motif} style={style}>
        <h2 dangerouslySetInnerHTML={{ __html: doc[motif].title }} />
        {sources.map((book, idx) => (
          <section key={motif + book}>
            {doc[motif].sources[book].map((entry, idx) => {
              const entryContent =
                `${entry.starred ? '***' : ''}
                ${entry.locations.repeat ? '' : entry.locations.raw}
                ${entry.content}`;
              return (
                <p
                  key={motif + book + idx}
                  dangerouslySetInnerHTML={{ __html: idx
                    ? entryContent
                    : `<h3>${book}</h3> ${entryContent}`
                  }}
                />
              );
            }
          )}
          </section>
        ))}
      </chapter>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app
}), null)(Motif));
