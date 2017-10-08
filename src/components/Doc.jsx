import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import qs from 'query-string';

import appActions from '../redux/app/actions';
import searchActions from '../redux/search/actions';

import EntriesByMotif from './EntriesByMotif.jsx';
import EntriesBySource from './EntriesBySource.jsx';

class Doc extends PureComponent {
  constructor(props) {
    super(props);
    this._updateRows(this.props);
  }

  componentWillMount() {
    const query = qs.parse(this.props.location.search);
    if (query.entry) {
      this.props.searchEntries(query.entry);
    }
  }

  componentWillReceiveProps(nextProps) {
    const queryChanged = (
      this.props.location.search !== nextProps.location.search
    );
    const resultsChanged = (
      this.props.searchState.results !== nextProps.searchState.results
    );

    if (!queryChanged && !resultsChanged) {
      return;
    }

    if (queryChanged) {
      const query = qs.parse(nextProps.location.search);
      if (query.entry) {
        this.props.searchEntries();
      }
    }

    this._updateRows(nextProps);
  }

  _updateRows(props) {
    const { doc, entriesBySource } = props.appState;
    const query = qs.parse(props.location.search);

    this._rows = Object.keys(doc);
    this._rowComponent = ({ index, key, style }) =>
      <EntriesByMotif
        mid={index}
        motif={doc[this._rows[index]]}
        key={key}
        style={style}
      />;

    if (query.motif) {
      this._rows = [query.motif];
    } else if (query.source) {
      this._rows = [query.source];
      this._rowComponent = ({ index, key, style }) =>
        <EntriesBySource
          sid={index}
          entries={entriesBySource[query.source]}
          key={key}
          style={style}
        />;
    } else if (query.entry) {
      this._rows = Object.keys(props.searchState.results);
      this._rowComponent = ({ index, key, style }) =>
        <EntriesBySource
          sid={this._rows[index]}
          entries={props.searchState.results[this._rows[index]]}
          key={key}
          style={style}
          showHeader
          highlight={query.entry.split(/\s/)}
        />;
    }
  }

  render() {
    const query = qs.parse(this.props.location.search);
    return (
      <div className="doc">
        {query.entry || query.motif || query.source ?
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
