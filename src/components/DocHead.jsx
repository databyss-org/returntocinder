import React from 'react';

import cx from 'classnames';
import ColumnHead from './ColumnHead.jsx';
import styles from '../app.scss';

const DocHead = ({ transitionState, query }) =>
  <div className={cx(styles.docHead, styles[transitionState])}>
    <ColumnHead query={query} />
    {query.aside &&
      <ColumnHead query={{ motif: true, term: query.aside, type: 'motif' }} />}
  </div>;

export default DocHead;
