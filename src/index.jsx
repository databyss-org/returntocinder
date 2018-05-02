import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import viewportUnitsBuggyfill from 'viewport-units-buggyfill';
import 'reset-css/reset.css';
import store from './redux/configureStore';

import Main from './components/Main.jsx';

viewportUnitsBuggyfill.init();

render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
