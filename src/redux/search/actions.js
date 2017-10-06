import PromiseWorker from 'promise-worker';
import SearchWorker from './worker';

const searchWorker = new PromiseWorker(new SearchWorker());

export default {
  indexEntries() {
    return async (dispatch, getState) => {
      dispatch({
        type: 'INDEX_ENTRIES'
      });
      await searchWorker.postMessage({
        type: 'INDEX',
        payload: {
          entryList: getState().app.entryList
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
          query: query || getState().search.query
        }
      });
      dispatch({
        type: 'SEARCH_ENTRIES_RESULTS',
        payload: {
          results,
          query
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
