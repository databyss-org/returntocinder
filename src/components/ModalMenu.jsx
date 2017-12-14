import React from 'react';
import cx from 'classnames';
import styles from '../app.scss';

export default ({ children, isActive }) => (
  <div className={cx(styles.modalMenu, { [styles.show]: isActive }) }>
    <div className={styles.container}>
      {children}
    </div>
  </div>
);
