export function urlify(m) {
  return m.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function textify(m) {
  return m.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s{2,}/g, ' ');
}
