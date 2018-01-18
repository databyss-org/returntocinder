import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import ColumnHead from './ColumnHead.jsx';
import styles from '../app.scss';

const DocHead = ({ transitionState, query, app, search }) =>
  <div className={cx(styles.docHead, styles[transitionState])}>
    <ColumnHead
      query={query}
      doc={app.doc}
      biblio={app.biblio}
      entriesBySource={app.entriesBySource}
      isWorking={search.isWorking}
      resultsMeta={search.resultsMeta}
      styles={styles}
    />
    {query.aside &&
      <ColumnHead
        query={{ motif: true, term: query.aside, type: 'motif' }}
        doc={app.doc}
        styles={styles}
      />
    }
  </div>;

export default connect(state => state)(DocHead);
