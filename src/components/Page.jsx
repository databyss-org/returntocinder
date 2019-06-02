import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Subnav from './Subnav.jsx';
import styles from '../app.scss';
import actions from '../redux/app/actions';
import withLoader from '../hoc/withLoader';

const Page = ({ path, subnavPath, content, menu, useHash }) => (
  <div className={styles.about}>
    <div className={styles.container}>
      <div className={styles.head}>
        <Subnav menu={menu} basePath={subnavPath} useHash={useHash} />
      </div>
      <header>{content.title}</header>
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
                    <p
                      key={idx2}
                      dangerouslySetInnerHTML={{
                        __html: para,
                      }}
                    />
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

export default compose(
  connect(
    state => ({
      appState: state.app,
    }),
    actions
  ),
  withLoader({
    propsToLoad: props => ({
      content: props.contentFunc
        ? props.contentFunc(props)
        : props.appState.pages[props.path],
      menu: props.appState.menus[props.subnavPath],
    }),
    loaderActions: props => ({
      content: () => props.fetchPage(props.path),
      menu: () => props.fetchMenu(props.subnavPath),
    }),
    showLoader: true,
  })
)(Page);
