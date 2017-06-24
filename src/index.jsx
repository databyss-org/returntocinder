import React from 'react';
import { render } from 'react-dom';
import 'reset-css/reset.css';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';

import './app.scss';
import Main from './components/Main.jsx';
import reducer from './reducer';

const injectMiddleware = deps => ({ dispatch, getState }) => next => async action =>
  typeof action === 'function'
    ? action({ dispatch, getState, ...deps }).then(data => next(data))
    : next(action);

const store = createStore(
  reducer,
  applyMiddleware(createLogger(), injectMiddleware())
);

render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
