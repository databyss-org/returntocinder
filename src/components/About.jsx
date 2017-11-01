import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Subnav from './Subnav.jsx';
import styles from '../app.scss';
import config from '../content/config.json';
import * as data from '../content/about';

class About extends PureComponent {
  render() {
    const _content = data[this.props.match.params.page];
    const content = typeof _content === 'function'
      ? _content(this.props)
      : _content;

    return (
      <div className={styles.about}>
        <div className={styles.head}>
          <div className={styles.title}>
            <Link to="/">
              {config.title}
            </Link>
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

export default withRouter(connect(state => ({
  appState: state.app,
}), null)(About));
