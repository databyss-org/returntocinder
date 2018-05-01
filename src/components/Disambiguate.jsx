import React from 'react';
import cx from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import freezeProps from '../hoc/freezeProps';
import { getViewportHeight } from '../lib/dom';
import styles from '../app.scss';
import motifs from '../content/motifs.json';
import CloseIcon from '../icons/close.svg';
import actions from '../redux/app/actions';

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

const Disambiguate = ({ midList, isVisible, position, hideDisambiguate }) => (
  <div
    className={cx(styles.disambiguate, { [styles.isVisible]: isVisible })}
    style={{ top: position.top }}
    ref={(elem) => {
      if (elem && isVisible) {
        reposition(elem);
      }
    }}
  >
    <div className={styles.motifList}>
      {midList.map(mid => (
        <span className={styles.motifListItem} key={mid}>
          <a
            href={`/motif/${mid}`}
            dangerouslySetInnerHTML={{ __html: motifs[mid] }}
          />
        </span>))}
    </div>
    <div
      className={cx(
        styles.disambiguateCloseBox,
        { [styles.isVisible]: isVisible }
      )}
      onClick={() => hideDisambiguate()}
    >
      <CloseIcon />
    </div>
  </div>
);

export default compose(
  connect(state => ({ ...state.app.disambiguate }), actions),
  withRouter,
  freezeProps({
    propsToFreeze: props => ({
      midList: props.isVisible,
      position: props.isVisible
    })
  })
)(Disambiguate);
