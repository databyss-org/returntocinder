import { list } from './data/entries';
import { groupBySource } from './data/entries/list';
import { filterEntriesByAuthor } from '../lib/indexers';

export async function searchEntries({ query, groupBy, withMeta, author }) {
  const entryList = await list({ content: query });
  const { filteredEntryList, cfauthors } = filterEntriesByAuthor({
    entryList,
    author
  });
  const count = filteredEntryList.length;
  const groupedBySource = groupBySource(filteredEntryList).sources;
  let sourceList = [];
  if (withMeta) {
    sourceList = Object.keys(groupedBySource);
  }

  return {
    results: groupedBySource,
    resultsMeta: {
      cfauthors,
      count,
      sourceList,
    }
  };
}
