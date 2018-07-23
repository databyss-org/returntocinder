import { list } from '../mongo';

export const groupBySource = entries => ({
  sources: entries.reduce((dict, entry) => {
    if (!dict[entry.source.id]) {
      dict[entry.source.id] = [];
    }
    dict[entry.source.id].push(entry);
    return dict;
  }, {}),
  entryCount: entries.length,
});

export const groupByAuthor = entries => entries.reduce((dict, entry) => {
  if (!dict[entry.author.id]) {
    dict[entry.author.id] = [];
  }
  dict[entry.author.id].push(entry);
  return dict;
}, {});

export const groupByMotif = entries => entries.reduce((dict, entry) => {
  entry.motif.forEach((motif) => {
    if (!dict[motif.id]) {
      dict[motif.id] = [];
    }
    dict[motif.id].push(entry);
  });
  return dict;
}, {});

export default async (query) => {
  const q = query || {};
  let content = {};
  if (q.content) {
    const words = q.content.split(' ');
    if (words.length <= 1 || q.content.match('"')) {
      content = { '$text': { '$search': q.content } };
    } else {
      content = { '$text': { '$search': words.map(word => `"${word}"`).join(' ') } };
    }
  }
  const findQuery = {
    ...q.author ? { 'source.author': q.author } : {},
    ...q.motifId ? { 'motif.id': q.motifId } : {},
    ...q.sourceId ? { 'source.id': q.sourceId } : {},
    ...content,
  };
  const orderBy = {
    'locations.low': 1,
    'locations.high': 1,
  };
  const entries = await list('entries', findQuery, orderBy);
  switch (q.groupBy) {
    case 'source': {
      return groupBySource(entries);
    }
    case 'motif': {
      return groupByMotif(entries);
    }
    case 'author': {
      return groupByAuthor(entries);
    }
    default: {
      return entries;
    }
  }
};
