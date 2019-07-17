const initialState = {
  isIndexing: false,
  isIndexed: false,
  results: {},
  resultsMeta: {},
  queryMeta: {
    count: 0,
  },
  query: '',
  cfauthors: [],
  isWorking: false,
  isSourcesLoading: false,
}

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'INDEX_ENTRIES': {
      return {
        ...state,
        isIndexing: true,
      }
    }
    case 'ENTRIES_INDEXED': {
      return {
        ...state,
        isIndexing: false,
        isIndexed: true,
      }
    }
    case 'SET_QUERY': {
      return {
        ...state,
        query: action.payload.query,
      }
    }
    case 'SET_QUERY_RESULTS': {
      const { resultsMeta, query } = action.payload
      return {
        ...state,
        query,
        queryMeta: {
          count: resultsMeta.count,
        },
      }
    }
    case 'SEARCH_ENTRIES': {
      return {
        ...state,
        query: action.payload.query,
        isWorking: true,
      }
    }
    case 'SEARCH_ENTRIES_LIST': {
      return {
        ...state,
        isSourcesLoading: true,
      }
    }
    case 'SEARCH_ENTRIES_LIST_RESOLVED': {
      return {
        ...state,
        isSourcesLoading: false,
      }
    }

    case 'SEARCH_ENTRIES_RESULTS': {
      const term = `${action.payload.query}:${action.payload.author}`
      let filteredResults = {}
      let filteredResultsMeta = {}
      const authorList = Object.keys(state.results).filter(
        a => a.split(':')[0] === action.payload.query
      )
      authorList.map(a => (filteredResults[a] = state.results[a]))
      const authorMetaList = Object.keys(state.resultsMeta).filter(
        a => a.split(':')[0] === action.payload.query
      )
      authorMetaList.map(a => (filteredResultsMeta[a] = state.resultsMeta[a]))
      return {
        ...state,
        results: {
          ...filteredResults,
          [term]: action.payload.results,
        },
        isWorking: false,
        resultsMeta: {
          ...filteredResultsMeta,
          [term]: action.payload.resultsMeta,
        },
        cfauthors: action.payload.cfauthors,
      }
    }

    default: {
      return state
    }
  }
}
