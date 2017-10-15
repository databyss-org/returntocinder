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
    this.query = props.query;
    this._updateRows(this.props);
  }

  componentWillMount() {
    if (this.query.search) {
      this.props.searchEntries(this.query.term);
    }
  }

  componentWillReceiveProps(nextProps) {
    const queryChanged = !shallowequal(this.query, nextProps.query);
    const resultsChanged = (
      this.props.searchState.results !== nextProps.searchState.results
    );

    if (queryChanged) {
      this.query = nextProps.query;
      if (this.query.search) {
        this.props.searchEntries(this.query.term);
      }
    }

    if (queryChanged || resultsChanged) {
      this._updateRows(nextProps);
    }
  }

  _updateRows(props) {
    const { doc, entriesBySource } = props.appState;
    const { search, motif, source, term } = this.query;
    const { path } = this.props;

    this._rows = Object.keys(doc);
    this._rowComponent = ({ index, key, style }) =>
      <EntriesByMotif
        mid={index}
        motif={doc[this._rows[index]]}
        key={key}
        style={style}
        path={path}
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
          path={path}
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
          path={path}
        />;
    }
  }

  render() {
    return this._rows.map((key, index) =>
      this._rowComponent({ index, key, style: {} }));
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), { ...appActions, ...searchActions })(Doc));
