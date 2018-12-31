const { DEFAULT_AUTHOR } = process.env;

export const parseTerm = term => {
  let author = DEFAULT_AUTHOR;
  let resource = term;
  if (term.match(/:/)) {
    [resource, author] = term.split(':');
  } else {
    term = `${term}:${DEFAULT_AUTHOR}`;
  }
  return { author, resource, term };
};

// if hash is a source hash (e.g. "#source:[sid]"), return source ID,
//  otherwise returns false
export const sourceHash = hash =>
  hash.match(/source:/) ? hash.split(':')[1] : false;

// if hash is an about path, return subsection, otherwise return false
export const aboutHash = hash =>
  hash.match(/about\//) ? hash.split('/')[1] : false;
