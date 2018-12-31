import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import styles from '../app.scss';

const Motifs = ({ history, motifList }) => (
  <div className={styles.frontMotifs}>
    {motifList.map(motif => (
      <a
        href={`/motif/${motif.id}/sources`}
        key={motif.id}
        dangerouslySetInnerHTML={{ __html: motif.name }}
        onClick={e => {
          e.preventDefault();
          history.push(`/motif/${motif.id}/sources`);
        }}
      />
    ))}
  </div>
);

export default withRouter(
  connect(state => ({ motifList: state.app.motifList }))(Motifs)
);
