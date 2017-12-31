import React from 'react';
import { connect } from 'react-redux';
import { Route, matchPath, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import Doc from './Doc.jsx';
import DocHead from './DocHead.jsx';
import actions from '../redux/app/actions';
import withLoader from '../hoc/withLoader';
import styles from '../app.scss';

const asidePath = '/(motif|source|search)/(.*)/motif::term';

const getQuery = ({ location, match }) => {
  const aside = matchPath(location.pathname, asidePath);
  return {
    term: match.params.term,
    search: match.params[0] === 'search',
    motif: match.params[0] === 'motif',
    source: match.params[0] === 'source',
    aside: Boolean(aside && aside.params.term)
  };
};

const DocContainer = ({ search, match, query }) =>
  <Transition in={query.aside} timeout={300}>
    {state =>
      <div className={cx(styles.docContainer, {
        [styles.withAside]: query.aside
      })}>
        <DocHead transitionState={state} />
        <div className={cx(styles.doc, styles[state], {
            [styles.show]: !search.isWorking
          })}>
          <Route
            path='/(motif|source|search)/:term'
            render={props => (
              <main>
                <Doc
                  query={query} path={['main']}
                  ready={state === 'entered'}
                />
              </main>
            )}
          />
          <Route
            path={asidePath}
            render={props => (
              <aside>
                <Doc
                  query={{
                    motif: true,
                    term: match.params.term
                  }}
                  path={['aside']}
                  ready={state === 'entered'}
                />
              </aside>
            )}
          />
        </div>
      </div>
    }
  </Transition>;

export default compose(
  connect(state => state, actions),
  withRouter,
  withLoader({
    propsToLoad: (props) => {
      const query = getQuery(props);
      return {
        query,
        ...(query.motif ? {
          motif: props.app.doc[query.term]
        } : {}),
        ...(query.source ? {
          source: props.app.entriesBySource[query.term]
        } : {}),
      };
    },
    loaderActions: (props) => {
      const query = getQuery(props);
      return {
        ...(query.motif ? {
          motif: () => props.fetchMotif(query.term),
        } : {}),
        ...(query.source ? {
          source: () => props.fetchSource(query.term),
        } : {}),
      };
    },
  }),
)(DocContainer);
