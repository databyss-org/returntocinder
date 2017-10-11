/* eslint-disable import/prefer-default-export */

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
