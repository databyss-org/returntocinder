import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import DatabyssIcon from '../icons/databyss.svg';
import ArrowIcon from '../icons/angle.svg';
import styles from '../app.scss';
import actions from '../redux/app/actions';

class Hamburger extends PureComponent {
  onClick({ homeLinkOnly, onClick, history, evt }) {
    if (homeLinkOnly) {
      history.push('/');
    } else {
      onClick(evt);
    }
  }
  render() {
    const { isActive, navLink, homeLinkOnly, onClick, history } = this.props;
    return (
      <button
        className={cx(styles.hamburger, {
          [styles.isActive]: isActive,
          [styles.homeLinkOnly]: homeLinkOnly,
          [styles.navLink]: navLink,
        })}
        onClick={evt => this.onClick({ homeLinkOnly, onClick, history, evt })}
      >
        {navLink ? <div className={styles.linkText}>{navLink}</div> : [
          <div className={styles.glow} />,
          <div className={styles.databyss}>
            <DatabyssIcon />
          </div>
        ]}
        <div className={styles.arrow}>
          <ArrowIcon />
        </div>
      </button>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
}), actions)(Hamburger));
