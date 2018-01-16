/* eslint-disable arrow-body-style */
import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { compose } from 'redux';
import actions from '../redux/app/actions';
import withAction from '../hoc/withAction';
import styles from '../app.scss';
import CloseIcon from '../icons/close.svg';

const close = ({ location, history }) => {
  history.replace(location.pathname.replace(/\/source:(.*)?/g, ''));
};

const DocModal = ({ title, children, isActive, location, history }) =>
  <div className={cx(styles.docModal, { [styles.show]: isActive })}>
    <div className={styles.mask} onClick={() => close({ location, history })} />
    <div className={styles.contentHeader}>
      <span>{title}</span>
      <CloseIcon onClick={() => close({ location, history })} />
    </div>
    <div className={styles.content}>
      {children}
    </div>
  </div>;

export default compose(
  connect(state => state, actions),
  withAction(props => props.showMask(props.isActive))
)(DocModal);
