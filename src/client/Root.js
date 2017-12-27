import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import App from '../components/App'

// We need a Root component for React Hot Loading.
function Root() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default Root
