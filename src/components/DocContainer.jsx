import React, { PureComponent } from 'react';
import { Route, matchPath } from 'react-router-dom';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import Doc from './Doc.jsx';
import styles from '../scss/doc.scss';
import { scrollDocsTo } from '../lib/dom';

const tranStyles = {
  exited: {
    container: {
      overflow: 'scroll'
    },
    main: {
      width: '100%',
      overflow: 'visible'
    }
  },
  entered: {
    container: {
      overflow: 'hidden'
    },
    main: {
      width: '55%',
      overflow: 'scroll',
      paddingRight: '2em'
    }
  }
};
tranStyles.entering = tranStyles.entered;
tranStyles.exiting = tranStyles.exited;

export default class DocContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.asidePath = '/(motif|source|search)/(.*)/motif::term';
    this.state = {
      query: this.getQuery(this.props)
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      query: this.getQuery(nextProps)
    });
  }
  componentDidUpdate(prevProps) {
    const hashChanged = this.props.location.hash !== prevProps.location.hash;
    if (hashChanged) {
      this.updateScroll();
    }
  }
  updateScroll() {
    scrollDocsTo(this.props.location.hash.replace('#', ''));
  }
  getQuery(props) {
    const aside = matchPath(props.location.pathname, this.asidePath);
    return {
      term: props.match.params.term,
      search: props.match.params[0] === 'search',
      motif: props.match.params[0] === 'motif',
      source: props.match.params[0] === 'source',
      aside: Boolean(aside && aside.params.term)
    };
  }
  render() {
    return (
      <Transition in={this.state.query.aside} timeout={300}>
        {state => (
          <div
            className={styles.container}
            style={tranStyles[state].container}
          >
            <Route
              path='/(motif|source|search)/:term'
              render={props => (
                <main className={styles.main} style={tranStyles[state].main}>
                  <Doc query={this.getQuery(props)} path={['main']} />
                </main>
              )}
            />
            <Route
              path={this.asidePath}
              render={props => (
                <aside className={
                  cx(styles.aside, { [styles.show]: state === 'entered' })
                }>
                  <Doc
                    query={{
                      motif: true,
                      term: props.match.params.term
                    }}
                    path={['aside']}
                  />
                </aside>
              )}
            />
          </div>
        )}
      </Transition>
    );
  }
}
