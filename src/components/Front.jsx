/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import Transition from 'react-transition-group/Transition';
import config from '../content/config.json';
import styles from '../app.scss';
import defer from './Defer.jsx';
import Loader from './Loader.jsx';
import Motifs from './Motifs.jsx';

const actionQ = [
  [
    {
      action: props => props.fetchEntries(),
      completeWhen: props => props.appState.entryList,
      message: 'Loading entries'
    },
    {
      action: props => props.fetchBiblio(),
      completeWhen: props => props.appState.biblio,
      message: 'Loading bibliography'
    }
  ],
  [
    {
      action: props => props.fetchDoc(),
      completeWhen: props => props.appState.doc,
      message: 'Loading full index'
    },
    {
      action: props => props.indexEntries(props.appState.entryList),
      completeWhen: props => props.searchState.isIndexed,
      message: 'Indexing entries'
    }
  ]
];

class Front extends PureComponent {
  constructor(props) {
    super(props);

    this.Motifs = defer({
      Wrapped: Motifs,
      untilStatus: 'READY'
    });
  }
  render() {
    const inProp = this.props.appState.status === 'READY';
    return (
      <Transition in={inProp} timeout={200}>
        {(state) => {
          return (
            <div className={cx(styles.front, {
              [styles.withMotifs]: state === 'entered' || state === 'entering'
            })}>
              <div className={styles.head}>
                <div className={styles.title}>
                  {config.title}
                </div>
                <p>
                  {config.inscription}
                  <Link to='/about/frontis'>read more</Link>
                </p>
                <Loader
                  queue={actionQ}
                  onComplete={props => props.setStatus('READY')}
                />
              </div>
              <div className={cx(styles.body, {
                [styles.show]: state === 'entered'
              })}>
                <Loader displayOnly />
                <this.Motifs />
              </div>
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default connect(state => ({
  appState: state.app,
}), null)(Front);
