export function urlifyMotif(m) {
  return m.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function textifyMotif(m) {
  return m.replace(/<\/?[^>]+(>|$)/g, '');
}
