import { addMotifsToBiblio, motifListFromEntries } from '../../lib/indexers';

const initialState = {
  config: null,
  doc: {},
  entriesBySource: {},
  biblio: null,
  authorDict: null,
  entryList: null,
  sourceList: null,
  motifList: null,
  motifDict: {},
  query: '',
  maskIsVisible: false,
  isLoading: false,
  motifLinksAreActive: false,
  menu: {
    isVisible: false,
    target: null,
  },
  search: {
    isVisible: false,
    isFocused: false,
    target: null,
  },
  disambiguate: {
    target: null,
    isVisible: false,
    midList: [],
    position: {
      left: 0,
      top: 0,
    },
  },
  pages: {},
  menus: {},
  idLinksAreActive: false,
  showAllMotifEntries: false,
  showAllSourceEntries: false,
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
        ...action.payload,
      };

    case 'RECEIVE_DOC':
      return {
        ...state,
        biblio: addMotifsToBiblio(state.biblio, state.entriesBySource),
        ...action.payload,
      };

    case 'RECEIVE_MOTIF': {
      const { author, mid, motif, sid } = action.payload;
      const key = sid ? `${mid}:${author}:${sid}` : `${mid}:${author}`;
      return {
        ...state,
        doc: {
          ...state.doc,
          [key]: motif,
        },
      };
    }

    case 'RECEIVE_MOTIFS': {
      const { motifList, motifDict } = action.payload;
      return {
        ...state,
        motifList,
        motifDict,
      };
    }

    case 'RECEIVE_AUTHORS': {
      const { authorList, authorDict } = action.payload;
      return {
        ...state,
        authorList,
        authorDict,
      };
    }

    case 'RECEIVE_PAGE': {
      const { path, content } = action.payload;
      return {
        ...state,
        pages: {
          ...state.pages,
          [path]: content,
        },
      };
    }

    case 'RECEIVE_MENU': {
      const { path, menu } = action.payload;
      return {
        ...state,
        menus: {
          ...state.menus,
          [path]: menu,
        },
      };
    }

    case 'RECEIVE_CONFIG': {
      const { config } = action.payload;
      return {
        ...state,
        config: config.reduce((dict, c) => ({ ...dict, [c.key]: c.value }), {}),
      };
    }

    case 'RECEIVE_SOURCE_ENTRIES':
      return {
        ...state,
        entriesBySource: {
          ...state.entriesBySource,
          [action.payload.sid]: action.payload.entries,
        },
        biblio: {
          ...state.biblio,
          [action.payload.sid]: {
            ...state.biblio[action.payload.sid],
            motifs: motifListFromEntries(action.payload.entries),
          },
        },
      };

    case 'SET_LOADING': {
      return { ...state, isLoading: action.payload };
    }

    case 'SHOW_MASK': {
      return { ...state, maskIsVisible: action.payload };
    }

    case 'TOGGLE_SEARCH_IS_VISIBLE': {
      return {
        ...state,
        search: {
          ...state.search,
          isVisible: true,
          target: action.payload,
        },
      };
    }

    case 'HIDE_SEARCH': {
      return {
        ...state,
        search: {
          ...state.search,
          isVisible: false,
        },
      };
    }

    case 'SEARCH_FOCUSED': {
      return {
        ...state,
        search: {
          ...state.search,
          isFocused: true,
          target: action.payload,
        },
        menu: {
          ...state.menu,
          isVisible: false,
        },
        disambiguate: {
          ...state.disambiguate,
          isVisible: false,
        },
      };
    }

    case 'MASK_CLICKED': {
      state.disambiguate.target &&
        action.payload !== state.disambiguate.target &&
        state.disambiguate.target.classList.remove(
          state.disambiguate.className
        );
      return {
        ...state,
        menu: {
          ...state.menu,
          isVisible:
            action.payload === state.menu.target && state.menu.isVisible,
        },
        search: {
          ...state.search,
          isFocused: action.payload === state.search.target,
          isVisible: action.payload === state.search.target,
        },
        disambiguate: {
          ...state.disambiguate,
          isVisible: action.payload === state.disambiguate.target,
        },
      };
    }

    case 'MENU_VISIBLE': {
      return {
        ...state,
        menu: {
          ...state.menu,
          ...action.payload,
        },
      };
    }

    case 'MOTIF_LINKS_ACTIVE': {
      return { ...state, motifLinksAreActive: action.payload };
    }

    case 'ID_LINKS_ACTIVE': {
      return { ...state, idLinksAreActive: action.payload };
    }

    case 'HIDE_DISAMBIGUATE': {
      state.disambiguate.target &&
        state.disambiguate.target.classList.remove(
          state.disambiguate.className
        );
      return {
        ...state,
        disambiguate: {
          ...state.disambiguate,
          isVisible: false,
        },
      };
    }

    case 'SHOW_DISAMBIGUATE': {
      state.disambiguate.target &&
        state.disambiguate.target.classList.remove(
          state.disambiguate.className
        );
      action.payload.target.classList.add(action.payload.className);
      return {
        ...state,
        disambiguate: {
          isVisible: true,
          ...action.payload,
        },
      };
    }

    default: {
      return state;
    }
  }
}
