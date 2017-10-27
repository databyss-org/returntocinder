import registerPromiseWorker from 'promise-worker/register';
import { indexEntries, searchEntries } from '../../lib/search';
import { groupEntriesBySource } from '../../lib/indexers';

let index = null;

const processMap = {
  'GROUP_BY_SOURCE': groupEntriesBySource
};

registerPromiseWorker((action) => {
  switch (action.type) {
    case 'INDEX': {
      index = indexEntries(action.payload.entryList);
      return true;
    }
    case 'SEARCH': {
      const { query, processResults, withMeta } = action.payload;
      return searchEntries({
        index,
        query,
        processResults: processMap[processResults],
        withMeta
      });
    }
  }
  throw new Error(`Invalid action type "${action.type}"`);
});
