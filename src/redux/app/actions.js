import axios from 'axios';
import {
  sourceListFromBiblio,
  motifListFromMotifs,
  groupEntriesBySource
} from '../../lib/indexers';

export default {
  fetchDoc() {
    return async (dispatch) => {
      dispatch({
        type: 'FETCH_DOC'
      });
      const doc = (await axios.get('/full.json')).data;
      const motifList = motifListFromMotifs(doc);

      return dispatch({
        type: 'RECEIVE_DOC',
        payload: {
          doc,
          motifList,
        }
      });
    };
  },
  fetchBiblio() {
    return async (dispatch) => {
      dispatch({
        type: 'FETCH_BIBLIO'
      });
      const biblio = (await axios.get('/biblio.json')).data;
      const sourceList = sourceListFromBiblio(biblio);

      return dispatch({
        type: 'RECEIVE_BIBLIO',
        payload: {
          biblio,
          sourceList
        }
      });
    };
  },
  fetchEntries() {
    return async (dispatch) => {
      dispatch({
        type: 'FETCH_ENTRIES'
      });
      const entryList = (await axios.get('/entries.json')).data;
      const entriesBySource = groupEntriesBySource(entryList);

      return dispatch({
        type: 'RECEIVE_ENTRIES',
        payload: {
          entryList,
          entriesBySource
        }
      });
    };
  },
  setStatus(status) {
    return {
      type: 'SET_STATUS',
      payload: status
    };
  },
  showMask(show) {
    return {
      type: 'SHOW_MASK',
      payload: show
    };
  },
  toggleSearchIsVisible() {
    return {
      type: 'TOGGLE_SEARCH_IS_VISIBLE'
    };
  }
};
