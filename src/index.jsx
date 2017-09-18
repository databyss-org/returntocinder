import React from 'react';
import { render } from 'react-dom';
import 'reset-css/reset.css';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';

import './app.scss';
import Main from './components/Main.jsx';
import appReducer from './reducer';

const reducer = combineReducers({
  app: appReducer
});

const injectMiddleware = deps => ({ dispatch, getState }) => next => async action =>
  typeof action === 'function'
    ? action({ dispatch, getState, ...deps }).then(data => next(data))
    : next(action);

const enhancer = compose(
  applyMiddleware(createLogger(), injectMiddleware())
);

const store = createStore(reducer, enhancer);

render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
