import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import styles from '../app.scss';

const Source = ({ app, sid }) =>
  !sid ? null :
  <div className={styles.source}>
    <Link to={`/source/${sid}`}>
      <h2 dangerouslySetInnerHTML={{ __html: app.biblio[sid].title }} />
    </Link>
    {app.biblio[sid].citations.map((citation, idx) =>
      <p key={idx} dangerouslySetInnerHTML={{ __html: citation }} />
    )}
  </div>;

export default connect(state => state)(Source);
