import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import styles from '../app.scss';

const Motifs = ({ history, motifList }) =>
  <ul className={styles.motifs}>
    {motifList.map(motif => (
      <li key={motif.id}
        dangerouslySetInnerHTML={{ __html: motif.name }}
        onClick={() => history.push(`/motif/${motif.id}`)}
      />
    ))}
  </ul>;

export default withRouter(
  connect(state => ({ motifList: state.app.motifList }))(Motifs)
);
