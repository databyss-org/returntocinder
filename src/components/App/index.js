import React from 'react'
import { Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../store/configureStore'
import styles from './styles.scss'

import ScrollToTop from '../ScrollToTop'
import Front from '../Front'

const App = () =>
  <Provider store={store}>
    <ScrollToTop>
      <main className={styles.app}>
        <div className={styles.content}>
          <Route exact path="/" component={Front} />
        </div>
      </main>
    </ScrollToTop>
  </Provider>

export default App
