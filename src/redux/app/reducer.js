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
    case 'FETCH_DOC': {
      return { ...state, isFetching: true };
    }
    case 'RECEIVE_DOC': {
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

    default: {
      return state;
    }
  }
}
