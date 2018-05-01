/* eslint-disable arrow-body-style */
import React from 'react';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import config from '../content/config.json';
import styles from '../app.scss';
import Motifs from './Motifs.jsx';
import actions from '../redux/app/actions';

const Front = ({ location, toggleSearchIsFocused }) =>
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
          {config.title}
        </div>
        <p>
          {config.inscription}
          <Link to='/about/frontis'>read more</Link>
        </p>
      </div>
      <div className={cx(styles.body, styles.show)}>
        <Motifs />
      </div>
    </div>
  </div>;

export default withRouter(connect(state => state, actions)(Front));
