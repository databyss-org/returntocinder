import * as actions from './actions';

const initialState = {
  doc: null,
  isFetching: false
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_DOC: {
      return { ...state, doc: action.payload };
    }

    default: {
      return state;
    }
  }
}
