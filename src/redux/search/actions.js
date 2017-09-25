import PromiseWorker from 'promise-worker';
import SearchWorker from './worker';

const searchWorker = new PromiseWorker(new SearchWorker());

export default {
  indexEntries(entryList) {
    return async (dispatch) => {
      dispatch({
        type: 'INDEX_ENTRIES'
      });
      await searchWorker.postMessage({
        type: 'INDEX',
        payload: {
          entryList
        }
      });
      dispatch({
        type: 'ENTRIES_INDEXED'
      });
    };
  },
  searchEntries(query) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SEARCH_ENTRIES',
      });
      const results = await searchWorker.postMessage({
        type: 'SEARCH',
        payload: {
          query: getState().search.query
        }
      });
      dispatch({
        type: 'SEARCH_ENTRIES_RESULTS',
        payload: {
          results
        }
      });
    };
  },
  setQuery(query) {
    return {
      type: 'SET_QUERY',
      payload: {
        query
      }
    };
  }
};
