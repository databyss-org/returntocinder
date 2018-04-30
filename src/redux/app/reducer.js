import { addMotifsToBiblio, motifListFromEntries } from '../../lib/indexers';

const initialState = {
  doc: {},
  entriesBySource: {},
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
  motifLinksAreActive: false,
  disambiguate: {
    isVisible: false,
    midList: [],
    position: {
      left: 0, top: 0
    }
  }
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

    case 'RECEIVE_MOTIF': {
      const { author, mid, motif } = action.payload;
      return {
        ...state,
        doc: {
          ...state.doc,
          [author ? `${mid}:${author}` : mid]: motif
        },
      };
    }

    case 'RECEIVE_SOURCE_ENTRIES':
      return {
        ...state,
        entriesBySource: {
          ...state.entriesBySource,
          [action.payload.sid]: action.payload.entries
        },
        biblio: {
          ...state.biblio,
          [action.payload.sid]: {
            ...state.biblio[action.payload.sid],
            motifs: motifListFromEntries(action.payload.entries)
          }
        },
      };

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

    case 'DISAMBIGUATE_VISIBLE': {
      state.disambiguate.target &&
        state.disambiguate.target.classList.remove(state.disambiguate.className);
      return {
        ...state,
        disambiguate: {
          ...state.disambiguate,
          isVisible: false
        }
      };
    }

    case 'SHOW_DISAMBIGUATE': {
      state.disambiguate.target &&
        state.disambiguate.target.classList.remove(state.disambiguate.className);
      action.payload.target.classList.add(action.payload.className);
      return {
        ...state,
        disambiguate: {
          isVisible: true,
          ...action.payload
        }
      };
    }

    default: {
      return state;
    }
  }
}
