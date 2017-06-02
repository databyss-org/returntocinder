import React from 'react';
import { render } from 'react-dom';
import 'reset-css/reset.css';
import './app.scss';

import Main from './components/Main.jsx';

render(
  <Main />,
  document.getElementById('root')
);
