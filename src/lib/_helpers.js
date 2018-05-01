import latinize from 'latinize';

export function urlify(m) {
  return m.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// remove all html tags
export function textify(m) {
  return m.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s{2,}/g, ' ');
}

export function sanitize(str) {
  return textify(latinize(str.toLowerCase()));
}

export function simplify(str) {
  return str.replace(/<\/em>( )*<em>/ig, (match, p1) => p1 ? ' ' : '');
}

export function elipses({ text, maxLength }) {
  if (text.length < maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}…`;
}

export function stemify(str) {
  return latinize(str.toLowerCase()).replace(/[^a-z]/, '');
}
