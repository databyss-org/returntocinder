import React, { PureComponent } from 'react';
import cx from 'classnames';
import styles from '../app.scss';

export default class Hamburger extends PureComponent {
  render() {
    return (
      <button
        className={cx(styles.hamburger, {
          [styles.isActive]: this.props.isActive,
        })}
        onClick={this.props.onClick}
      >
        <span className={styles.hamburgerBox}>
          <span className={styles.hamburgerInner} />
        </span>
      </button>
    );
  }
}
