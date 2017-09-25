import axios from 'axios';
import {
  entriesFromMotifs,
  entryListFromEntries,
  sourcesFromEntries,
  sourceListFromBiblio,
  motifListFromMotifs
} from '../../lib/indexers';

export default {
  fetchDoc() {
    return async (dispatch) => {
      dispatch({
        type: 'FETCH_DOC'
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
        type: 'RECEIVE_DOC',
        motifs,
        entries,
        sources,
        biblio,
        sourceList,
        motifList,
        entryList
      });
    };
  }
};
