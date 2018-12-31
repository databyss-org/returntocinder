import React from 'react';
import { withRouter } from 'react-router';
import styles from '../app.scss';

const SourcesByMotif = ({ term, doc, history }) => (
  <div style={styles.sourcesByMotif}>
    <h2>Books and Publications</h2>
    <ul>
      {doc[term].sources.map((source) => {
        const href = `/motif/${doc[term].id}/${source.id}`;
        return (
          <li key={source.id}>
            <a
              dangerouslySetInnerHTML={{ __html: source.title }}
              href={href}
              onClick={(evt) => {
                evt.preventDefault();
                history.push(href);
              }}
            />
            ({source.entryCount})
          </li>
        );
      })}
    </ul>
  </div>
);

export default withRouter(SourcesByMotif);
