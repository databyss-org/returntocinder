import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Entry from './Entry.jsx';

class EntriesByMotif extends PureComponent {
  render() {
    const { mid, motif, style } = this.props;

    return (
      <article key={mid} style={style}>
        <h2 dangerouslySetInnerHTML={{ __html: motif.title }} />
        {Object.keys(motif.sources).map((sid, idx) => (
          <section key={motif + sid}>
            <h3>{sid}</h3>
            {motif.sources[sid].map((entry, idx) =>
              <Entry
                key={motif + sid + idx}
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
