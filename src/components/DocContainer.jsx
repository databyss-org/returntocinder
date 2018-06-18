import React from 'react';
import { connect } from 'react-redux';
import { matchPath, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import qs from 'qs';
import Doc from './Doc.jsx';
import DocHead from './DocHead.jsx';
import Disambiguate from './Disambiguate.jsx';
import appActions from '../redux/app/actions';
import searchActions from '../redux/search/actions';
import withLoader from '../hoc/withLoader';
import freezeProps from '../hoc/freezeProps';
import styles from '../app.scss';

const { DEFAULT_AUTHOR } = process.env;

const getAsideTerm = (location) => {
  const asidePath = '/(motif|source|search)/(.*)/motif::term';
  const match = matchPath(location.pathname, asidePath);
  if (match) {
    return match.params.term;
  }
  return null;
};

const parseTerm = (term) => {
  let author = DEFAULT_AUTHOR;
  let resource = term;
  if (term.match(/:/)) {
    [resource, author] = term.split(':');
  } else {
    term = `${term}:${DEFAULT_AUTHOR}`;
  }
  return { author, resource, term };
};

let mainElement = null;

const getQuery = ({ location, match, app }) => {
  let { term } = match.params;
  let author = DEFAULT_AUTHOR;
  let resource = term;

  // handle author selector in the term
  //  ex: /motif/absolute:KA
  if (location.search) {
    location.query = qs.parse(location.search.replace('?', ''));
  }

  const asideTerm = getAsideTerm(location);
  let aside;
  if (asideTerm) {
    aside = parseTerm(asideTerm);
  }

  // parse author or set default
  switch (match.params[0]) {
    case 'search':
    case 'motif': {
      ({ author, resource, term } = parseTerm(term));
      break;
    }
    case 'source': {
      if (term.match(/\./)) {
        [author, resource] = term.split('.');
      }
      break;
    }
  }

  return {
    term,
    author,
    resource,
    type: match.params[0],
    search: match.params[0] === 'search',
    motif: match.params[0] === 'motif',
    source: match.params[0] === 'source',
    aside,
    isLinked: app.motifLinksAreActive
  };
};

const onClick = ({ history, e, showDisambiguate }) => {
  let { target } = e;
  if (target.tagName.toLowerCase() === 'em') {
    target = target.parentNode;
  }
  if (
    target.tagName.toLowerCase() === 'a' &&
    target.pathname.match(/disambiguate\//)
  ) {
    e.preventDefault();
    const position = {
      top: target.getBoundingClientRect().top
        - mainElement.getBoundingClientRect().top
        + mainElement.scrollTop
        + 15
    };
    showDisambiguate({
      midList: target.search.match(/mids=(.+)&?/)[1].split(','),
      position,
      target,
      className: styles.disambiguateLink
    });
    return;
  }
  if (
    target.tagName.toLowerCase() === 'a' &&
    target.pathname.match(/motif\//)
  ) {
    // redirect motif link clicks
    e.preventDefault();
    history.push(target.pathname);
  }
};

const DocContainer = ({ search, match, query, history, showDisambiguate }) =>
  <Transition in={Boolean(query.aside)} timeout={300}>
    {state =>
      <div
        onClick={e => onClick({ e, history, showDisambiguate })}
        className={cx(styles.docContainer, {
          [styles.withAside]: query.aside
        })}
      >
        <DocHead transitionState={state} query={query} />
        <div className={cx(styles.doc, styles[state], {
          [styles.show]: true
        })}>
          <main ref={(elem) => { mainElement = elem; }}>
            <Doc
              query={query}
              path={['main']}
              ready={state === 'entered'}
            />
            <Disambiguate />
          </main>
          {query.aside &&
            <aside>
              <Doc
                query={{
                  ...query,
                  motif: true,
                  ...query.aside,
                }}
                path={['aside']}
                ready={state === 'entered'}
              />
            </aside>}
        </div>
      </div>
    }
  </Transition>;

export default compose(
  connect(state => state, { ...appActions, ...searchActions }),
  withRouter,
  withLoader({
    propsToLoad: (props) => {
      const query = getQuery(props);
      return {
        query,
        ...(query.motif ? {
          motif: props.app.doc[query.term]
        } : {}),
        ...(query.aside ? {
          aside: props.app.doc[query.aside.term]
        } : {}),
        ...(query.source ? {
          source: props.app.entriesBySource[query.term]
        } : {}),
        ...(query.search ? {
          results: props.search.results[query.term]
        } : {})
      };
    },
    loaderActions: (props) => {
      const query = getQuery(props);
      return {
        ...(query.motif ? {
          motif: () => props.fetchMotif({
            mid: query.resource,
            author: query.author
          }),
        } : {}),
        ...(query.aside ? {
          aside: () => props.fetchMotif({
            mid: query.aside.resource,
            author: DEFAULT_AUTHOR
          }),
        } : {}),
        ...(query.source ? {
          source: () => props.fetchSource({ sid: query.term }),
        } : {}),
        ...(query.search ? {
          results: () => props.searchEntries({
            query: query.resource,
            author: query.author,
          })
        } : {})
      };
    },
  }),
  freezeProps({
    propsToFreeze: props => ({
      query: !props.isLoading,
    })
  }),
)(DocContainer);
