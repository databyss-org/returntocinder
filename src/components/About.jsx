import React from 'react';
import { connect } from 'react-redux';
import Subnav from './Subnav.jsx';
import styles from '../app.scss';
import actions from '../redux/app/actions';
import * as data from '../content/about';

const About = ({ match, appState, toggleSearchIsFocused }) => {
  if (!match) {
    return null;
  }
  const _content = data[match.params.page];
  const content = typeof _content === 'function'
    ? _content(appState)
    : _content;

  return (
    <div
      className={styles.about}
      onClick={() => toggleSearchIsFocused(false)}
    >
      <div className={styles.container}>
        <div className={styles.head}>
          <Subnav menu={data.menu} basePath={'about'} />
        </div>
        <header>
          {content.title}
        </header>
        <div className={styles.body} id="about">
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
    </div>
  );
};

export default connect(state => ({
  appState: state.app,
}), actions)(About);
