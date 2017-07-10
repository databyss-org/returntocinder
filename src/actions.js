import axios from 'axios';
import {
  entriesFromMotifs,
  sourcesFromEntries,
  sourceListFromBiblio,
  motifListFromMotifs
} from './lib/indexers';

export const FETCH_DOC = 'FETCH_DOC';

export function fetchDoc() {
  return async ({ dispatch, request }) => {
    dispatch({
      type: FETCH_DOC,
      fetching: true
    });
    const motifs = (await axios.get('full.json')).data;
    const biblio = (await axios.get('biblio.json')).data;
    // console.log('motifs', motifs);
    // console.log('biblio', biblio);
    const entries = entriesFromMotifs(motifs);
    // console.log('entries', entries);
    const sources = sourcesFromEntries(entries);
    // console.log('sources', sources);
    const sourceList = sourceListFromBiblio(biblio);
    const motifList = motifListFromMotifs(motifs);
    // console.log(motifList)
    return {
      type: FETCH_DOC,
      motifs,
      entries,
      sources,
      biblio,
      sourceList,
      motifList
    };
  };
}
