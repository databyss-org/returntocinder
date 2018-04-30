import React from 'react';
import cx from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import freezeProps from '../hoc/freezeProps';
import { getViewportHeight } from '../lib/dom';
import styles from '../app.scss';

const reposition = (el) => {
  const vh = getViewportHeight();
  const { top } = el.getBoundingClientRect();
  const height = el.clientHeight;
  const thresh = 50;
  const offset = 20;

  if ((top + height) > (vh - thresh)) {
    const elTop = parseFloat(el.style.top.replace('px', 0));
    const newTop = elTop - height - offset;
    el.style.top = `${newTop}px`;
  }
};

const Disambiguate = ({ midList, isVisible, position }) => (
  <div
    className={cx(styles.disambiguate, { [styles.isVisible]: isVisible })}
    style={{ top: position.top }}
    ref={(elem) => {
      if (elem && isVisible) {
        reposition(elem);
      }
    }}
  >
    {midList.map(mid => <span>
      <Link to={`/motif/${mid}`}>
        {mid}
      </Link>
    </span>)}
  </div>
);

export default compose(
  connect(state => ({ ...state.app.disambiguate })),
  freezeProps({
    propsToFreeze: props => ({
      midList: props.isVisible,
      position: props.isVisible
    })
  })
)(Disambiguate);
