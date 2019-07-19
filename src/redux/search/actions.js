import axios from 'axios'

let queryIdx = 0

const { API_URL } = process.env
const { DEFAULT_AUTHOR } = process.env

export default {
  searchEntries({ query, author }) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SEARCH_ENTRIES',
        payload: {
          query,
          author,
        },
      })
      const results = await axios.get(`${API_URL}/search`, {
        params: {
          query: query || getState().search.query,
          groupBy: 'source',
          withMeta: true,
          author,
        },
      })
      dispatch({
        type: 'SEARCH_ENTRIES_RESULTS',
        payload: {
          ...results.data.results,
          query,
          author,
        },
      })
    }
  },

  searchEntriesList({ query, authorsList }) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SEARCH_ENTRIES_LIST',
      })
      const asyncDispatch = list => {
        const promises = list.map(async a => {
          const results = await axios.get(`${API_URL}/search`, {
            params: {
              query: query || getState().search.query,
              groupBy: 'source',
              withMeta: true,
              author: a,
            },
          })
          dispatch({
            type: 'SEARCH_ENTRIES_RESULTS',
            payload: {
              ...results.data.results,
              query,
              author: a,
            },
          })
        })
        return Promise.all(promises)
      }
      asyncDispatch(authorsList).then(e =>
        dispatch({
          type: 'SEARCH_ENTRIES_LIST_RESOLVED',
        })
      )
    }
  },

  setQuery({ query, author }) {
    return async (dispatch, getState) => {
      queryIdx += 1
      dispatch({
        type: 'SET_QUERY',
        payload: { query, id: queryIdx, author: DEFAULT_AUTHOR },
      })
      const results = await axios.get(`${API_URL}/search`, {
        params: { query, id: queryIdx, author: DEFAULT_AUTHOR },
      })
      if (results.data.id < queryIdx) {
        return
      }
      dispatch({
        type: 'SET_QUERY_RESULTS',
        payload: {
          ...results.data.results,
          query,
        },
      })
    }
  },
}
