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
        payload: {
          query
        }
      });
      const results = await searchWorker.postMessage({
        type: 'SEARCH',
        payload: {
          query: query || getState().search.query,
          processResults: 'GROUP_BY_SOURCE',
          withMeta: true
        }
      });
      dispatch({
        type: 'SEARCH_ENTRIES_RESULTS',
        payload: {
          ...results,
          query
        }
      });
    };
  },
  setQuery(query) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SET_QUERY',
        payload: { query }
      });
      const results = await searchWorker.postMessage({
        type: 'SEARCH',
        payload: { query }
      });
      dispatch({
        type: 'SET_QUERY_RESULTS',
        payload: {
          ...results,
          query
        }
      });
    };
  },
  searchFocused(focused) {
    return {
      type: 'SEARCH_FOCUSED',
      payload: focused
    };
  }
};
