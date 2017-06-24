import axios from 'axios';

export const FETCH_DOC = 'FETCH_DOC';

export function fetchDoc() {
  return async ({ dispatch, request }) => {
    dispatch({
      type: FETCH_DOC,
      fetching: true
    });
    const res = await axios.get('full.json');
    console.log(res);
    return {
      type: FETCH_DOC,
      payload: res.data
    };
  };
}
