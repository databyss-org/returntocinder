import {
  Search,
  PrefixIndexStrategy
} from 'js-search';

import { sanitize } from '../lib/_helpers';

export function indexEntries(entryLists) {
  const search = new Search('id');
  search.sanitizer = { sanitize };
  search.indexStrategy = new PrefixIndexStrategy();

  search.addIndex('content');
  entryLists.forEach(entryList =>
    search.addDocuments(entryList)
  );

  return search;
}

export function searchEntries({ index, query, processResults, withMeta }) {
  const entries = index.search(query);
  const results = processResults ? processResults(entries) : entries;
  const motifs = {};

  if (withMeta) {
    entries.forEach((entry) => {
      entry.motif.forEach((m) => {
        motifs[m.id] = m;
      });
    });
  }

  return {
    results,
    resultsMeta: {
      count: entries.length,
      ...(withMeta ? {
        sourceList: Object.keys(results),
        motifList: (Object.keys(motifs).reduce(
          (list, mid) => list.concat(motifs[mid]), []
        )).sort((a, b) => a.id < b.id ? -1 : 1)
      } : {
        sourceList: [],
        motifList: []
      })
    }
  };
}
