import React from 'react'
import { connect } from 'react-redux'
import { Link } from '../Raw'
import styles from './styles.scss'

const Motifs = ({ app }) =>
  <div className={styles.motifs}>
    {Object.keys(app.doc).map(m =>
      <Link key={m} to={`/motif/${m}`} html={app.doc[m].title} />
    )}
  </div>

export default connect(state => state)(Motifs)
