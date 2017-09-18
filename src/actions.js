import axios from 'axios';
import {
  entriesFromMotifs,
  entryListFromEntries,
  sourcesFromEntries,
  sourceListFromBiblio,
  motifListFromMotifs
} from './lib/indexers';
import searchEntries from './lib/search';

export const FETCH_DOC = 'FETCH_DOC';
export const SEARCH_ENTRIES = 'SEARCH_ENTRIES';
export const SET_QUERY = 'SET_QUERY';

export const actions = {
  fetchDoc() {
    return async ({ dispatch }) => {
      dispatch({
        type: FETCH_DOC,
        fetching: true
      });
      const motifs = (await axios.get('full.json')).data;
      const biblio = (await axios.get('biblio.json')).data;
      // console.log('motifs', motifs);
      // console.log('biblio', biblio);
      const entries = entriesFromMotifs(motifs, biblio);
      const entryList = entryListFromEntries(entries);
      // console.log('entries', entries);
      const sources = sourcesFromEntries(entries);
      // console.log('sources', sources);
      const sourceList = sourceListFromBiblio(biblio);
      const motifList = motifListFromMotifs(motifs);
      // console.log(motifList)
      return dispatch({
        type: FETCH_DOC,
        motifs,
        entries,
        sources,
        biblio,
        sourceList,
        motifList,
        entryList
      });
    };
  },
  searchEntries(query) {
    return async ({ dispatch, getState }) => {
      const { entryList } = getState().app;
      dispatch({
        type: SEARCH_ENTRIES,
        results: searchEntries({ entryList, query }),
        query
      });
    };
  },
  setQuery(query) {
    return {
      type: SET_QUERY,
      query
    };
  }
};
