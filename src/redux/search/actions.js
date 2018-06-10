import axios from 'axios';

let queryIdx = 0;

const { API_URL } = process.env;
const { DEFAULT_AUTHOR } = process.env;

export default {
  searchEntries({ query, author }) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SEARCH_ENTRIES',
        payload: {
          query,
          author
        }
      });
      const results = await axios.get(`${API_URL}/search`, {
        params: {
          query: query || getState().search.query,
          groupBy: 'source',
          withMeta: true,
          author
        }
      });
      dispatch({
        type: 'SEARCH_ENTRIES_RESULTS',
        payload: {
          ...results.data.results,
          query,
          author
        }
      });
    };
  },
  setQuery({ query, author }) {
    return async (dispatch, getState) => {
      queryIdx += 1;
      dispatch({
        type: 'SET_QUERY',
        payload: { query, id: queryIdx, author: DEFAULT_AUTHOR }
      });
      const results = await axios.get(`${API_URL}/search`, {
        params: { query, id: queryIdx, author: DEFAULT_AUTHOR }
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
