/* eslint-disable arrow-body-style */
import React from 'react';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import styles from '../app.scss';
import Motifs from './Motifs.jsx';
import actions from '../redux/app/actions';

const Front = ({ location, toggleSearchIsFocused, app }) =>
  <div
    className={cx(styles.front, {
      [styles.showFull]: Boolean(matchPath(
        location.pathname, { path: '/', exact: true })
      )
    })}
  >
    <div className={cx(styles.container, styles.withMotifs)}>
      <div className={styles.head}>
        <div className={styles.title}>
          {app.pages['/'].title}
        </div>
        <p>
          {app.pages['/'].body}
          &nbsp;
          <Link to='/about/frontis'>&hellip;</Link>
        </p>
      </div>
      <div className={cx(styles.body, styles.show)}>
        <Motifs />
      </div>
    </div>
  </div>;

export default withRouter(connect(state => state, actions)(Front));
