import React from 'react';
import { withRouter } from 'react-router';
import motifNames from '../content/motifs.json';
import { motifListFromNames } from '../lib/indexers';
import styles from '../app.scss';

const Motifs = ({ history }) =>
  <ul className={styles.motifs}>
    {motifListFromNames(motifNames).map(m => (
      <li key={m.id}
        dangerouslySetInnerHTML={{ __html: m.name }}
        onClick={() => history.push(`/motif/${m.id}`)}
      />
    ))}
  </ul>;

export default withRouter(Motifs);
