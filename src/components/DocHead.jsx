import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import ColumnHead from './ColumnHead';
import Toggle from './Toggle';
import actions from '../redux/app/actions';
import styles from '../app.scss';

const DocHead = ({ transitionState, query, app, search, toggleMotifLinks }) =>
  <div className={cx(styles.docHead, styles[transitionState])}>
    <Toggle
      isActive={app.motifLinksAreActive}
      onClick={() => toggleMotifLinks(!app.motifLinksAreActive)}
    >
      Motif Links
    </Toggle>
    <ColumnHead
      query={query}
      doc={app.doc}
      results={search.results[query.term]}
      resultsMeta={search.resultsMeta[query.term]}
      biblio={app.biblio}
      entriesBySource={app.entriesBySource}
      styles={styles}
      authorDict={app.authorDict}
    />
    {query.aside &&
      <ColumnHead
        query={{ motif: true, term: query.aside, type: 'motif' }}
        doc={app.doc}
        styles={styles}
      />
    }
  </div>;

export default connect(state => state, actions)(DocHead);
