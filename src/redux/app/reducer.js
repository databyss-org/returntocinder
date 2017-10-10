const initialState = {
  doc: null,
  biblio: null,
  entryList: null,
  entriesBySource: null,
  sourceList: null,
  motifList: null,
  query: '',
  status: 'STARTUP',
  showMask: false
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'RECEIVE_DOC':
    case 'RECEIVE_BIBLIO':
    case 'RECEIVE_ENTRIES':
      return {
        ...state,
        ...action.payload
      };

    case 'SET_STATUS': {
      return { ...state, status: action.payload };
    }

    case 'SHOW_MASK': {
      return { ...state, showMask: action.payload };
    }

    default: {
      return state;
    }
  }
}
