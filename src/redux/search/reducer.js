const initialState = {
  isIndexing: false,
  isIndexed: false,
  results: {},
  resultsMeta: {},
  queryMeta: {
    count: 0
  },
  query: '',
  cfauthors: [],
  isWorking: false
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
      const { resultsMeta, query } = action.payload;
      return {
        ...state,
        query,
        queryMeta: {
          count: resultsMeta.count
        }
      };
    }
    case 'SEARCH_ENTRIES': {
      return {
        ...state,
        query: action.payload.query,
        isWorking: true
      };
    }
    case 'SEARCH_ENTRIES_RESULTS': {
      const term = `${action.payload.query}:${action.payload.author}`;
      return {
        ...state,
        results: {
          ...state.results,
          [term]: action.payload.results,
        },
        isWorking: false,
        resultsMeta: {
          ...state.resultsMeta,
          [term]: action.payload.resultsMeta
        },
        cfauthors: action.payload.cfauthors
      };
    }

    default: {
      return state;
    }
  }
}
