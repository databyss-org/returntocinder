import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Entry from './Entry.jsx';

function rowStyle(idx) {
  return {
    transitionDelay: `${idx * 50}ms`,
  };
}

class EntriesByMotif extends PureComponent {
  render() {
    const { mid, motif, style } = this.props;

    return (
      <article key={mid} style={style}>
        <h2 dangerouslySetInnerHTML={{ __html: motif.title }} />
        {Object.keys(motif.sources).map((sid, sidx) => (
          <section key={motif + sid} style={rowStyle(sidx)}>
            <h3>
              <Link to={`${this.props.location.pathname}/source:${sid}`}>
                {sid}
              </Link>
            </h3>
            {motif.sources[sid].map((entry, eidx) =>
              <Entry
                key={motif + sid + eidx}
                entry={entry}
                showRepeats
              />
            )}
          </section>
        ))}
      </article>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app
}), null)(EntriesByMotif));
