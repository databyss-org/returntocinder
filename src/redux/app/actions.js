import axios from 'axios';
import {
  sourceListFromSources,
  biblioFromSources,
  motifDictFromList,
  authorDictFromList,
} from '../../lib/indexers';

const { API_URL } = process.env;
const { DEFAULT_AUTHOR } = process.env;

export default {
  fetchSource({ sid }) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'FETCH_SOURCE_ENTRIES',
        payload: {
          sid,
        },
      });
      const entries = (await axios.get(`${API_URL}/sources/${sid}`)).data;
      return dispatch({
        type: 'RECEIVE_SOURCE_ENTRIES',
        payload: {
          sid,
          entries,
        },
      });
    };
  },
  fetchMotif({ mid, author, sid, showAll }) {
    return async (dispatch, getState) => {
      dispatch({
        type: 'FETCH_MOTIF',
        payload: {
          mid,
          sid,
          author,
        },
      });
      let csid = sid;
      if (!csid) {
        csid = showAll ? '_all' : '';
      }
      const motif = (await axios.get(
        [API_URL, 'motifs', mid, ...(csid ? [csid] : [])]
          .join('/')
          .concat(`?author=${author}`)
      )).data;
      return dispatch({
        type: 'RECEIVE_MOTIF',
        payload: {
          mid,
          motif,
          author,
          sid,
          showAll,
        },
      });
    };
  },
  fetchBiblio() {
    return async dispatch => {
      dispatch({
        type: 'FETCH_BIBLIO',
      });
      const sources = (await axios.get(`${API_URL}/sources`)).data;
      const sourceList = sourceListFromSources(sources);
      const biblio = biblioFromSources(sources);

      return dispatch({
        type: 'RECEIVE_BIBLIO',
        payload: {
          biblio,
          sourceList,
        },
      });
    };
  },
  fetchMotifs() {
    return async dispatch => {
      dispatch({
        type: 'FETCH_MOTIFS',
      });
      const motifList = (await axios.get(`${API_URL}/motifs`)).data;
      const motifDict = motifDictFromList(motifList);

      return dispatch({
        type: 'RECEIVE_MOTIFS',
        payload: {
          motifList,
          motifDict,
        },
      });
    };
  },
  fetchAuthors() {
    return async dispatch => {
      dispatch({
        type: 'FETCH_AUTHORS',
      });
      const authorList = (await axios.get(`${API_URL}/authors`)).data.sort(
        function(a, b) {
          return a.lastName
            .toLowerCase()
            .localeCompare(b.lastName.toLowerCase());
        }
      );
      const authorDict = authorDictFromList(authorList);

      return dispatch({
        type: 'RECEIVE_AUTHORS',
        payload: {
          authorList,
          authorDict,
        },
      });
    };
  },
  fetchPage(path) {
    return async dispatch => {
      dispatch({
        type: 'FETCH_PAGE',
        payload: {
          path,
        },
      });
      const content = (await axios.get(
        `${API_URL}/pages/${path.replace(/\//g, '%2f')}`
      )).data;

      return dispatch({
        type: 'RECEIVE_PAGE',
        payload: {
          content,
          path,
        },
      });
    };
  },
  fetchMenu(path) {
    return async dispatch => {
      dispatch({
        type: 'FETCH_MENU',
        payload: {
          path,
        },
      });
      const menu = (await axios.get(
        `${API_URL}/menus/${path.replace(/\//g, '%2f')}`
      )).data;

      return dispatch({
        type: 'RECEIVE_MENU',
        payload: {
          menu,
          path,
        },
      });
    };
  },
  fetchConfig() {
    return async dispatch => {
      dispatch({
        type: 'FETCH_CONFIG',
      });
      const config = (await axios.get(`${API_URL}/config`)).data;

      return dispatch({
        type: 'RECEIVE_CONFIG',
        payload: { config },
      });
    };
  },
  setLoading(loading) {
    return {
      type: 'SET_LOADING',
      payload: loading,
    };
  },
  showMask(show) {
    return (dispatch, getState) => {
      if (getState().app.maskIsVisible && show) {
        return null;
      }
      if (!getState().app.maskIsVisible && !show) {
        return null;
      }
      return dispatch({
        type: 'SHOW_MASK',
        payload: show,
      });
    };
  },
  toggleSearchIsVisible() {
    return {
      type: 'TOGGLE_SEARCH_IS_VISIBLE',
    };
  },
  hideSearch() {
    return {
      type: 'HIDE_SEARCH',
    };
  },
  toggleSearchIsFocused(focused) {
    return {
      type: 'SEARCH_FOCUSED',
      payload: focused,
    };
  },
  maskClicked(target) {
    return {
      type: 'MASK_CLICKED',
      payload: target,
    };
  },
  toggleMenuIsVisible(isVisible, target) {
    return {
      type: 'MENU_VISIBLE',
      payload: {
        isVisible,
        target,
      },
    };
  },
  toggleMotifLinks(areActive) {
    return {
      type: 'MOTIF_LINKS_ACTIVE',
      payload: areActive,
    };
  },
  toggleIdLinks(areActive) {
    return {
      type: 'ID_LINKS_ACTIVE',
      payload: areActive,
    };
  },
  hideDisambiguate() {
    return {
      type: 'HIDE_DISAMBIGUATE',
    };
  },
  showDisambiguate({ midList, position, target, className }) {
    return {
      type: 'SHOW_DISAMBIGUATE',
      payload: { midList, position, target, className },
    };
  },
  toggleSourceModal(sourceId) {
    return {
      type: 'TOGGLE_SOURCE_MODAL',
      payload: sourceId,
    };
  },
};
