import axios from 'axios';
import { entriesFromMotifs, sourcesFromEntries } from './lib/indexers';

export const FETCH_DOC = 'FETCH_DOC';

export function fetchDoc() {
  return async ({ dispatch, request }) => {
    dispatch({
      type: FETCH_DOC,
      fetching: true
    });
    const res = await axios.get('full.json');
    const motifs = res.data;
    console.log('motifs', motifs);
    const entries = entriesFromMotifs(motifs);
    console.log('entries', entries);
    const sources = sourcesFromEntries(entries);
    console.log('sources', sources);
    return { type: FETCH_DOC, motifs, entries, sources };
  };
}
