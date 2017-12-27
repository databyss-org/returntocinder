/* eslint-disable arrow-body-style */
import React from 'react'
import { Link } from 'react-router-dom'
import config from '../../content/config.json'
import styles from './styles.scss'
import Motifs from '../Motifs'

const Front = () =>
  <div className={styles.front}>
    <div className={styles.head}>
      <div className={styles.title}>
        {config.title}
      </div>
      <p>
        {config.inscription}
        <Link to='/about/frontis'>read more</Link>
      </p>
    </div>
    <div className={styles.body}>
      <Motifs />
    </div>
  </div>

export default Front
