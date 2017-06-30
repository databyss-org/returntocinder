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

import * as appActions from '../actions';
import { urlifyMotif } from '../lib/_helpers';

import Search from './Search.jsx';
import Motif from './Motif.jsx';

class Doc extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      doc: null
    };
    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50
    });
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const docChanged = (this.props.appState.doc !== nextProps.appState.doc);
    const queryChanged = (this.props.location.search !== nextProps.location.search);

    if (docChanged || queryChanged) {
      const queryMotif = qs.parse(nextProps.location.search).motif;
      this._motifs = queryMotif
        ? [queryMotif]
        : Object.keys(nextProps.appState.doc);

      // this.List && this.List.measureAllRows();
      this.List && this.List.recomputeRowHeights();
      // this.List && this.List.forceUpdateGrid();
    }
  }

  render() {
    const { doc } = this.props.appState;

    return doc ? (
      <div className="doc">
        <div className="searchContainer">
          <Search />
        </div>
        <div className="bodyContainer">
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    ref={(list) => { this.List = list; }}
                    deferredMeasurementCache={this._cache}
                    overscanRowCount={2}
                    rowCount={this._motifs.length}
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
        Loading...
      </div>
    );
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
        <Motif motif={this._motifs[index]} key={key} style={style} />
      </CellMeasurer>
    );
  }
}

export default connect(state => ({
  appState: state
}), appActions)(Doc);
