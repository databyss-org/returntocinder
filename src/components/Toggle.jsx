import React from 'react';
import cx from 'classnames';
import styles from '../app.scss';

const Toggle = ({ isActive, onClick, children }) =>
  <button className={cx(styles.toggle, { [styles.isActive]: isActive })} onClick={onClick}>
    <span className={styles.label}>
      {children}
    </span>
    <span className={styles.switch} />
  </button>;

export default Toggle;
