import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import qs from 'query-string';
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  AutoSizer,
  WindowScroller
} from 'react-virtualized';

import appActions from '../redux/app/actions';
import searchActions from '../redux/search/actions';

import Search from './Search.jsx';
import EntriesByMotif from './EntriesByMotif.jsx';
import EntriesBySource from './EntriesBySource.jsx';

class Doc extends PureComponent {
  constructor(props) {
    super(props);

    this._rowRenderer = this._rowRenderer.bind(this);
    this._resetRowCache();

    this._updateRows(this.props);
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

    this._updateRows(nextProps);

    this.List && this.List.recomputeRowHeights();
    this._resetRowCache();
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
        />;
    }
  }

  _resetRowCache() {
    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50
    });
  }

  _rowRenderer({ index, isScrolling, key, parent, style }) {
    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {this._rowComponent({ index, key, style })}
      </CellMeasurer>
    );
  }

  render() {
    return (
      <div className="doc">
        <Search />
        <main>
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    ref={(list) => { this.List = list; }}
                    deferredMeasurementCache={this._cache}
                    overscanRowCount={2}
                    rowCount={this._rows.length}
                    rowHeight={this._cache.rowHeight}
                    rowRenderer={this._rowRenderer}
                    width={width}
                    height={height}
                    isScrolling={isScrolling}
                    onScroll={onChildScroll}
                    scrollTop={scrollTop}
                    autoHeight
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        </main>
      </div>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), { ...appActions, ...searchActions })(Doc));
