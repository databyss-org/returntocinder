import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import styles from '../app.scss'
import Author from './Author'

const Authors = ({ history, authorList }) => {
  let list = authorList.slice()
  let length = Math.ceil(list.length / 2)
  var splitList = []
  while (list.length) {
    splitList.push(list.splice(0, length))
  }

  return (
    <div className={styles.authorsContainer}>
      <ul className={styles.frontAuthors}>
        {splitList[0] &&
          splitList[0].map(author => (
            <Author key={author.id} author={author} />
          ))}
      </ul>

      <ul className={styles.frontAuthors}>
        {splitList[1] &&
          splitList[1].map(author => (
            <Author key={author.id} author={author} />
          ))}
      </ul>
    </div>
  )
}

export default withRouter(
  connect(state => ({ authorList: state.app.authorList }))(Authors)
)
