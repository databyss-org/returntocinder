import React from 'react';
import { withRouter } from 'react-router';
import motifDict from '../content/motifs.json';
import styles from '../app.scss';

const Motifs = ({ history }) =>
  <ul className={styles.motifs}>
    {Object.keys(motifDict).map(mid => (
      <li key={mid}
        dangerouslySetInnerHTML={{ __html: motifDict[mid] }}
        onClick={() => history.push(`/motif/${mid}`)}
      />
    ))}
  </ul>;

export default withRouter(Motifs);
