import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import Subnav from './Subnav.jsx';
import styles from '../app.scss';
import config from '../content/config.json';
import * as data from '../content/about';

class About extends PureComponent {
  render() {
    const content = data[this.props.match.params.page];
    return (
      <div className={styles.about}>
        <div className={styles.head}>
          <div className={styles.title}>
            {config.title}
          </div>
          <Subnav menu={data.menu} />
        </div>
        <div className={styles.body}>
          <div className={styles.title}>
            {content.title}
          </div>
          {content.body.map((para, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
          ))}
          {content.footnotes && (
            <div className={styles.footnotes}>
              <ol>
                {content.footnotes.map((note, idx) => (
                  <li key={idx}>
                    {idx + 1}.&nbsp;
                    {note.map((para, idx2) => (
                      <p key={idx2} dangerouslySetInnerHTML={{
                        __html: para
                      }} />
                    ))}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(About);
