import axios from 'axios';

let queryIdx = 0;

const { API_URL } = process.env;

export default {
  searchEntries({ query }) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SEARCH_ENTRIES',
        payload: {
          query
        }
      });
      const results = await axios.get(`${API_URL}/search`, {
        params: {
          query: query || getState().search.query,
          groupBy: 'source',
          withMeta: true,
        }
      });
      dispatch({
        type: 'SEARCH_ENTRIES_RESULTS',
        payload: {
          ...results.data.results,
          query,
        }
      });
    };
  },
  setQuery(query) {
    return async (dispatch, getState) => {
      queryIdx += 1;
      dispatch({
        type: 'SET_QUERY',
        payload: { query, id: queryIdx }
      });
      const results = await axios.get(`${API_URL}/search`, {
        params: { query, id: queryIdx }
      });
      if (results.data.id < queryIdx) {
        return;
      }
      dispatch({
        type: 'SET_QUERY_RESULTS',
        payload: {
          ...results.data.results,
          query
        }
      });
    };
  }
};
