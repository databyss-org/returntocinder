import registerPromiseWorker from 'promise-worker/register';
import { indexEntries, searchEntries } from '../../lib/search';

let index = null;

registerPromiseWorker((action) => {
  switch (action.type) {
    case 'INDEX': {
      index = indexEntries(action.payload.entryList);
      return true;
    }
    case 'SEARCH': {
      return {
        results: searchEntries({ index, query: action.payload.query })
      };
    }
  }
  throw new Error(`Invalid action type "${action.type}"`);
});
