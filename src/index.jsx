import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import 'reset-css/reset.css';
import store from './redux/configureStore';

import './app.scss';
import Main from './components/Main.jsx';

render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
