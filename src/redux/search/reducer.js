const initialState = {
  isIndexing: false,
  isIndexed: false,
  results: [],
  query: '',
  resultCount: 0
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'INDEX_ENTRIES': {
      return {
        ...state,
        isIndexing: true
      };
    }
    case 'ENTRIES_INDEXED': {
      return {
        ...state,
        isIndexing: false,
        isIndexed: true
      };
    }
    case 'SET_QUERY': {
      return {
        ...state,
        query: action.payload.query
      };
    }
    case 'SET_QUERY_RESULTS': {
      const { results, query } = action.payload;
      return {
        ...state,
        query,
        resultCount: results.length
      };
    }
    case 'SEARCH': {
      return {
        ...state,
        query: action.payload.query
      };
    }
    case 'SEARCH_ENTRIES_RESULTS': {
      return {
        ...state,
        results: action.payload.results,
        resultCount: action.payload.results.length
      };
    }

    default: {
      return state;
    }
  }
}
