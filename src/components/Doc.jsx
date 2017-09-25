import React, { PureComponent } from 'react';
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
import Motif from './Motif.jsx';
import Entry from './Entry.jsx';

class Doc extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      doc: null
    };
    this._rowRenderer = this._rowRenderer.bind(this);
    this._resetRowCache();
  }

  componentDidMount() {
    this.props.fetchDoc();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.appState.doc) {
      // doc isn't ready yet
      return;
    }

    if (!nextProps.searchState.isIndexed) {
      // index the entries
      if (!nextProps.searchState.isIndexing) {
        this.props.indexEntries(nextProps.appState.entryList);
      }
      return;
    }

    this.updateRows(nextProps);
  }

  updateRows(nextProps) {
    const { doc, sources } = nextProps.appState;

    const docChanged = (this.props.appState.doc !== nextProps.appState.doc);
    const indexChanged = (
      !this.props.searchState.isIndexed && nextProps.searchState.isIndexed
    );
    const queryChanged = (this.props.location.search !== nextProps.location.search);

    if (!docChanged && !indexChanged && !queryChanged) {
      return;
    }

    const query = qs.parse(nextProps.location.search);

    let rows = Object.keys(doc);
    if (query.source) {
      rows = Object.keys(sources[query.source].entriesByMotif);
    } else if (query.entry) {
      rows = this.props.searchState.results;
    }

    this._rows = query.motif
      ? [query.motif]
      : rows;

    this.List && this.List.recomputeRowHeights();
    queryChanged && this._resetRowCache();
  }

  getStatus() {
    if (!this.props.appState.doc) {
      return 'LOADING';
    }
    if (!this.props.searchState.isIndexed) {
      return 'INDEXING';
    }
    return 'READY';
  }

  render() {
    return this.getStatus() === 'READY' ? (
      <div className="doc">
        <Search />
        <div className="bodyContainer">
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
        </div>
      </div>
    ) : (
      <div id="center">
        {{
          'LOADING': 'Loading...',
          'INDEXING': 'Indexing...'
        }[this.getStatus()]}
      </div>
    );
  }

  _resetRowCache() {
    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50
    });
  }

  _rowRenderer({ index, isScrolling, key, parent, style }) {
    const query = qs.parse(this.props.location.search);
    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {query.entry ? (
          <Entry eid={this._rows[index]} key={key} style={style} />
        ) : (
          <Motif motif={this._rows[index]} key={key} style={style} />
        )}
      </CellMeasurer>
    );
  }
}

export default connect(state => ({
  appState: state.app,
  searchState: state.search
}), { ...appActions, ...searchActions })(Doc);
