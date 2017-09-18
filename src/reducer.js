import * as actions from './actions';

const initialState = {
  doc: null,
  sources: null,
  entries: null,
  entryList: [],
  biblio: null,
  sourceList: null,
  motifList: null,
  isFetching: false,
  query: ''
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_DOC: {
      if (action.fetching) {
        return { ...state, isFetching: true };
      }
      return {
        ...state,
        isFetching: false,
        doc: action.motifs,
        sources: action.sources,
        entries: action.entries,
        entryList: action.entryList,
        biblio: action.biblio,
        sourceList: action.sourceList,
        motifList: action.motifList
      };
    }

    case actions.SEARCH_ENTRIES: {
      return {
        ...state,
        query: action.query,
        results: action.results
      };
    }

    case actions.SET_QUERY: {
      return {
        ...state,
        query: action.query
      };
    }

    default: {
      return state;
    }
  }
}
