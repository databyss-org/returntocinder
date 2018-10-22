import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import styles from '../app.scss';
import Author from './Author';

const Authors = ({ history, authorList }) =>
  <ul className={styles.motifs}>
    {authorList.map(author => (
      <Author key={author.id} author={author}/>
    ))}
  </ul>;

export default withRouter(
  connect(state => ({ authorList: state.app.authorList }))(Authors)
);
