import { list } from '../mongo';

const groupBySource = entries => ({
  sources: entries.reduce((dict, entry) => {
    if (!dict[entry.source.id]) {
      dict[entry.source.id] = [];
    }
    dict[entry.source.id].push(entry);
    return dict;
  }, {}),
  entryCount: entries.length,
});

const groupByAuthor = entries => entries.reduce((dict, entry) => {
  if (!dict[entry.author.id]) {
    dict[entry.author.id] = [];
  }
  dict[entry.author.id].push(entry);
  return dict;
}, {});

const groupByMotif = entries => entries.reduce((dict, entry) => {
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
  const findQuery = {
    ...q.author ? { 'source.author': q.author } : {},
    ...q.motifId ? { 'motif.id': q.motifId } : {},
    ...q.sourceId ? { 'source.id': q.sourceId } : {},
    ...q.content ? { '$text': { '$search': q.content } } : {},
  };
  const entries = await list('entries', findQuery);
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
