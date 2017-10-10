/* eslint-disable import/prefer-default-export */

export function lockBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : 'auto';
}
