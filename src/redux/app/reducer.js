import { addMotifsToBiblio } from '../../lib/indexers';

const initialState = {
  doc: {},
  biblio: null,
  entryList: null,
  entriesBySource: null,
  sourceList: null,
  motifList: null,
  query: '',
  status: 'READY',
  maskIsVisible: false,
  searchIsVisible: false,
  searchIsFocused: false,
  menuIsVisible: false
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'RECEIVE_ENTRIES':
    case 'RECEIVE_BIBLIO':
      return {
        ...state,
        ...action.payload
      };

    case 'RECEIVE_DOC':
      return {
        ...state,
        biblio: addMotifsToBiblio(state.biblio, state.entriesBySource),
        ...action.payload
      };

    case 'RECEIVE_MOTIF':
      return {
        ...state,
        doc: {
          ...state.doc,
          [action.payload.mid]: action.payload.motif
        }
      };

    case 'SET_STATUS': {
      return { ...state, status: action.payload };
    }

    case 'SHOW_MASK': {
      return { ...state, maskIsVisible: action.payload };
    }

    case 'TOGGLE_SEARCH_IS_VISIBLE': {
      return { ...state, searchIsVisible: !state.searchIsVisible };
    }

    case 'HIDE_SEARCH': {
      return { ...state, searchIsVisible: false };
    }

    case 'SEARCH_FOCUSED': {
      return {
        ...state,
        searchIsFocused: action.payload,
        menuIsVisible: action.payload ? false : state.menuIsVisible
      };
    }

    case 'MENU_VISIBLE': {
      return { ...state, menuIsVisible: action.payload };
    }

    default: {
      return state;
    }
  }
}
