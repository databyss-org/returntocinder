/* eslint-disable import/prefer-default-export */

import Tween from 'component-tween';
import raf from 'raf';

export function lockBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : 'auto';
  if (lock) {
    document.body.addEventListener('touchmove', _pd, false);
  } else {
    document.body.removeEventListener('touchmove', _pd, false);
  }
}

function _pd(e) {
  e.preventDefault();
}

export function scrollDocToElement(docname, elem) {
  scrollTo({
    containerElem: document.getElementsByTagName(docname)[0],
    targetElem: elem,
    duration: 300
  });
}

const rafHandles = {};

export function scrollTo({ containerElem, targetElem, duration }) {
  if (!containerElem || !targetElem) {
    return;
  }
  const offset = containerElem.clientHeight * 0.1;
  const elemTop = targetElem.offsetTop;
  const fromScrollTop = containerElem.scrollTop;
  const toScrollTop = elemTop - offset;
  const docName = containerElem.tagName;

  if (rafHandles[docName]) {
    raf.cancel(rafHandles[docName]);
  }

  const tween = Tween({ scrollTop: fromScrollTop })
    .ease('in-out-quad')
    .to({ scrollTop: toScrollTop })
    .duration(duration);

  tween.update((t) => {
    containerElem.scrollTop = t.scrollTop;
  });

  tween.on('end', () => {
    raf.cancel(rafHandles[docName]);
    rafHandles[docName] = null;
  });

  function tick() {
    tween.update();
    rafHandles[docName] = raf(tick);
  }

  tick();
}
