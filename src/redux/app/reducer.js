import { addMotifsToBiblio, motifListFromEntries } from '../../lib/indexers';

const initialState = {
  doc: {},
  linkedDoc: {},
  entriesBySource: {},
  linkedEntriesBySource: {},
  biblio: null,
  entryList: null,
  sourceList: null,
  motifList: null,
  query: '',
  maskIsVisible: false,
  searchIsVisible: false,
  searchIsFocused: false,
  menuIsVisible: false,
  isLoading: false,
  motifLinksAreActive: false
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_MOTIFS':
    case 'FETCH_SOURCE_ENTRIES':
      return {
        ...state,
        isLoading: true,
      };

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
      return (docKey => ({
        ...state,
        [docKey]: {
          ...state[docKey],
          [action.payload.mid]: action.payload.motif
        },
      }))(action.payload.isLinked ? 'linkedDoc' : 'doc');

    case 'RECEIVE_SOURCE_ENTRIES':
      return (entriesKey => ({
        ...state,
        [entriesKey]: {
          ...state[entriesKey],
          [action.payload.sid]: action.payload.entries
        },
        biblio: {
          ...state.biblio,
          [action.payload.sid]: {
            ...state.biblio[action.payload.sid],
            motifs: motifListFromEntries(action.payload.entries)
          }
        },
      }))(action.payload.isLinked ? 'linkedEntriesBySource' : 'entriesBySource');

    case 'SET_LOADING': {
      return { ...state, isLoading: action.payload };
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

    case 'MOTIF_LINKS_ACTIVE': {
      return { ...state, motifLinksAreActive: action.payload };
    }

    default: {
      return state;
    }
  }
}
