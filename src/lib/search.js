import {
  Search,
  PrefixIndexStrategy
} from 'js-search';

import { sanitize } from '../lib/_helpers';

import { groupEntriesBySource } from './indexers';

export function indexEntries(entryList) {
  const search = new Search('id');
  search.sanitizer = { sanitize };
  search.indexStrategy = new PrefixIndexStrategy();

  search.addIndex('content');
  search.addDocuments(entryList);

  return search;
}

export function searchEntries({ index, query }) {
  const results = index.search(query);
  return groupEntriesBySource(results);
}
