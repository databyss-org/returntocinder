/* eslint-disable prefer-template */

import { textify } from './_helpers';

const defaults = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  foreground: { red: 0, blue: 0, green: 0 },
  background: { red: 255, blue: 255, green: 255 },
  firstLineIndent: 0,
  indent: 0,
  align: 'left',
  valign: 'normal',
  fontSize: 24
};

export const sourcePattern = /^(\*{3})*\+*[A-Z.()]{1,8}i{0,3}( ?\([A-Z]+\))* /;

export function allMatches(re, str, capture = 0) {
  const matches = [];
  const nextMatch = () => {
    const m = re.exec(str);
    if (m) {
      matches.push(m[capture]);
      nextMatch();
    }
  };
  nextMatch();
  return matches;
}

export function getSource(chunk) {
  const p = renderPara(chunk);
  if (!p) return null;
  const c = textify(p);
  const s = c.match(sourcePattern);
  return s ? s[0] : null;
}

export function getChunkValue(chunk) {
  if (!chunk) {
    return '';
  }
  if (chunk.content && !chunk.content.length) {
    return '';
  }
  return chunk.content ? chunk.content[0].value : chunk.value;
}

export function styleTags(chunk) {
  let open = '';
  let close = '';
  if (chunk.style.italic && chunk.style.italic !== defaults.italic) {
    open += '<em>';
    close = '</em>' + close;
  }
  if (chunk.style.strikethrough && chunk.style.strikethrough !== defaults.strikethrough) {
    open += '<s>';
    close = '</s>' + close;
  }
  if (chunk.style.underline && chunk.style.underline !== defaults.underline) {
    open += '<u>';
    close = '</u>' + close;
  }
  if (chunk.style.valign && chunk.style.valign !== defaults.valign) {
    if (chunk.style.valign === 'super') {
      open += '<sup>';
      close = '</sup>' + close;
    } else if (chunk.style.valign === 'sub') {
      open += '<sup>';
      close = '</sup>' + close;
    }
  }
  if (chunk.style.fontSize && chunk.style.fontSize !== defaults.fontSize) {
    open += '<small>';
    close = '</small>' + close;
  }
  return { open, close };
}

export function renderPara(para) {
  if (!para) return null;
  // console.log('renderPara', para);
  const tags = styleTags(para);
  // for (const item of Object.keys(para.style)) {
  //   if (para.style[item] != null) defaults[item] = para.style[item];
  // }
  if (para.content) {
    if (para.content.length === 0) return null;
    return tags.open +
      para.content.map(span => renderPara(span, defaults)).join('') +
      tags.close;
  }
  if (para.value.length === 0) return null;
  return para.value.match(/[^\s]/) ? tags.open + para.value + tags.close : ' ';
}
