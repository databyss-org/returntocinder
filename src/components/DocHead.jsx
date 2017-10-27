import React, { PureComponent } from 'react';
import { Link, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from '../app.scss';

class DocHead extends PureComponent {
  renderColumnHead(params) {
    const { doc, biblio, entriesBySource } = this.props.appState;
    const { results, resultStats } = this.props.searchState;

    const mode = params[0];

    const stats = {
      motif: term => ({
        title: doc[term].title,
        entryCount: doc[term].entryCount,
        sourceCount: Object.keys(doc[term].sources).length
      }),
      source: term => ({
        title: biblio[term].title,
        entryCount: entriesBySource[term].length,
        motifCount: biblio[term].motifs.length
      }),
      search: term => ({
        title: `Results for: ${term}`,
        entryCount: results.length,
        motifCount: resultStats.motifCount,
        sourceCount: resultStats.sourceCount
      })
    }[mode](params.term);

    const display = {
      entries: (<span>{stats.entryCount} entries, </span>),
      motifs: (
        <span>
          {stats.motifCount} motifs
        </span>
      ),
      sources: (
        <span>
          {stats.sourceCount} sources
        </span>
      )
    };

    return (
      <header>
        <div className={styles.title}>
          <span dangerouslySetInnerHTML={{ __html: stats.title }} />
        </div>
        <div className={styles.stats}>
          {display.entries}
          {mode !== 'motif' && display.motifs}
          {mode !== 'source' && display.sources}
        </div>
      </header>
    );
  }
  render() {
    return (
      <div className={styles.docHead}>
        <Route
          path='/(motif|source|search)/:term'
          render={props => this.renderColumnHead(props.match.params)}
        />
        <Route
          path='/(motif|source|search)/(.*)/motif::term'
          render={props => this.renderColumnHead({
            0: 'motif',
            term: props.match.params.term
          })}
        />
      </div>
    );
  }
}

export default connect(state => ({
  appState: state.app,
  searchState: state.search
}), null)(DocHead);
