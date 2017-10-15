/* eslint-disable import/prefer-default-export */

// import Tween from 'component-tween'

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

export function scrollDocsTo(id) {
  scrollDocTo('main', id);
  scrollDocTo('aside', id);
}

export function scrollDocTo(docname, id) {
  scrollTo({
    containerElem: document.getElementsByTagName(docname)[0],
    targetElem: document.getElementById(`${docname}.${id}`),
    delay: 300
  });
}

export function scrollDocToElement(docname, elem) {
  scrollTo({
    containerElem: document.getElementsByTagName(docname)[0],
    targetElem: elem,
    delay: 300
  });
}

export function scrollTo({ containerElem, targetElem, delay }) {
  if (!containerElem || !targetElem) {
    return;
  }
  const offset = containerElem.clientHeight / 2 - targetElem.clientHeight / 2;
  const elemTop = targetElem.offsetTop;
  containerElem.scrollTop = elemTop - offset;

  // var raf = require('raf');
  // var button = document.querySelector('button');
  //
  // var tween = Tween({ rotate: 0, opacity: 0 })
  //   .ease('out-bounce')
  //   .to({ rotate: 360, opacity: 1  })
  //   .duration(800);
  //
  // tween.update(function(o){
  //   button.style.opacity = o.opacity;
  //   button.style.webkitTransform = 'rotate(' + (o.rotate | 0) + 'deg)';
  // });
  //
  // tween.on('end', function(){
  //   animate = function(){};
  // });
  //
  // function animate() {
  //   raf(animate);
  //   tween.update();
  // }
  //
  // animate();
}
