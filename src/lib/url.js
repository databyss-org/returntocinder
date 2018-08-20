const { DEFAULT_AUTHOR } = process.env;

export const parseTerm = (term) => {
  let author = DEFAULT_AUTHOR;
  let resource = term;
  if (term.match(/:/)) {
    [resource, author] = term.split(':');
  } else {
    term = `${term}:${DEFAULT_AUTHOR}`;
  }
  return { author, resource, term };
};
