import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
// import { applyWorker } from '../lib/redux-worker';
// import SearchWorker from './search/worker';
import app from './app/reducer';
import search from './search/reducer';

const middlewares = [thunk];
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(createLogger());
}

const enhancer = applyMiddleware(...middlewares);

const reducer = combineReducers({ app, search });

export default createStore(reducer, {}, enhancer);
