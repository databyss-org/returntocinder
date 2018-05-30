import { list } from './data/entries';

export async function searchEntries({ query, groupBy, withMeta }) {
  const entries = await list({ content: query, groupBy });

  let results = entries;
  let sourceList = [];
  let count = results.length;
  if (groupBy === 'source') {
    results = entries.sources;
    count = entries.entryCount;
    if (withMeta) {
      sourceList = Object.keys(results);
    }
  }

  return {
    results,
    resultsMeta: {
      count,
      sourceList,
    }
  };
}
