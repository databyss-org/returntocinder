import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
// import { applyWorker } from '../lib/redux-worker';
// import SearchWorker from './search/worker';
import app from './app/reducer';
import search from './search/reducer';

const enhancer = compose(
  applyMiddleware(thunk, createLogger()),
  // applyWorker(new SearchWorker())
);

const reducer = combineReducers({ app, search });

export default createStore(reducer, {}, enhancer);
