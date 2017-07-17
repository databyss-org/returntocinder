import axios from 'axios';
import { createSearchAction, createSearchSelectors } from 'redux-search';
import {
  entriesFromMotifs,
  entryListFromEntries,
  sourcesFromEntries,
  sourceListFromBiblio,
  motifListFromMotifs
} from './lib/indexers';

export const FETCH_DOC = 'FETCH_DOC';

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
  searchEntries: createSearchAction('entryList')
};
