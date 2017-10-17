import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Entries from './Entries.jsx';

function rowStyle(idx) {
  return {
    transitionDelay: `${idx * 50}ms`,
  };
}

class EntriesByMotif extends PureComponent {
  render() {
    const { mid, motif, style, path, setScroll } = this.props;

    return [
      <article key={mid} style={style}>
        <h2 dangerouslySetInnerHTML={{ __html: motif.title }} />
        {Object.keys(motif.sources).map((sid, sidx) => (
          <section key={motif + sid}>
            <Entries
              makeId={idx => motif + sid + idx}
              entries={motif.sources[sid]}
              showRepeats
              path={path.concat(sid)}
              setScroll={setScroll}
              inlineHead={(
                <h3>
                  <Link to={`${this.props.location.pathname}/source:${sid}`}>
                    {sid}
                  </Link>
                </h3>
              )}
            />
          </section>
        ))}
      </article>
    ];
  }
}

export default withRouter(connect(state => ({
  appState: state.app
}), null)(EntriesByMotif));
