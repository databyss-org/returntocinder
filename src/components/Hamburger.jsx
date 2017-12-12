import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import DatabyssIcon from '../icons/databyss.svg';
import styles from '../app.scss';

class Hamburger extends PureComponent {
  render() {
    const { isActive, homeLinkOnly, onClick, history } = this.props;
    return (
      <button
        className={cx(styles.hamburger, {
          [styles.isActive]: isActive,
          [styles.homeLinkOnly]: homeLinkOnly,
        })}
        onClick={homeLinkOnly ? () => history.push('/') : onClick}
      >
        <div className={styles.glow} />
        <div className={styles.databyss}>
          <DatabyssIcon />
        </div>
      </button>
    );
  }
}

export default withRouter(Hamburger);
