import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import shallowequal from 'shallowequal';

import appActions from '../redux/app/actions';
import searchActions from '../redux/search/actions';

import EntriesByMotif from './EntriesByMotif.jsx';
import EntriesBySource from './EntriesBySource.jsx';

class Doc extends PureComponent {
  constructor(props) {
    super(props);
    this.query = this.queryFromProps(props);
    this._updateRows(this.props);
  }

  componentWillMount() {
    if (this.query.search) {
      this.props.searchEntries(this.query.term);
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextQuery = this.queryFromProps(nextProps);

    const queryChanged = !shallowequal(this.query, nextQuery);
    const resultsChanged = (
      this.props.searchState.results !== nextProps.searchState.results
    );

    if (!queryChanged && !resultsChanged) {
      return;
    }

    if (queryChanged) {
      this.query = nextQuery;
      if (this.query.search) {
        this.props.searchEntries(this.query.term);
      }
    }

    this._updateRows(nextProps);
  }

  queryFromProps(props) {
    return {
      term: props.match.params.term,
      search: props.match.params[0] === 'search',
      motif: props.match.params[0] === 'motif',
      source: props.match.params[0] === 'source',
    };
  }

  _updateRows(props) {
    const { doc, entriesBySource } = props.appState;
    const { search, motif, source, term } = this.query;

    this._rows = Object.keys(doc);
    this._rowComponent = ({ index, key, style }) =>
      <EntriesByMotif
        mid={index}
        motif={doc[this._rows[index]]}
        key={key}
        style={style}
      />;

    if (motif) {
      this._rows = [term];
    } else if (source) {
      this._rows = [term];
      this._rowComponent = ({ index, key, style }) =>
        <EntriesBySource
          sid={index}
          entries={entriesBySource[term]}
          key={key}
          style={style}
        />;
    } else if (search) {
      this._rows = Object.keys(props.searchState.results);
      this._rowComponent = ({ index, key, style }) =>
        <EntriesBySource
          sid={this._rows[index]}
          entries={props.searchState.results[this._rows[index]]}
          key={key}
          style={style}
          showHeader
          highlight={term.split(/\s/)}
        />;
    }
  }

  render() {
    const { search, motif, source } = this.query;
    return (
      <div className="doc">
        { search || motif || source ?
          <main>
            {
              this._rows.map((key, index) =>
                this._rowComponent({ index, key, style: {} }))
            }
          </main>
        : null}
      </div>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), { ...appActions, ...searchActions })(Doc));
