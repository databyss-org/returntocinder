import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import qs from 'query-string';
import * as appActions from '../actions';
import { urlifyMotif } from '../lib/_helpers';

class Search extends Component {
  handleMotifChange(evt) {
    console.log(evt.target.value);
    const { value } = evt.target;
    const query = qs.parse(this.props.location.search);
    if (value === '--') {
      delete query.motif;
    }
    this.props.history.push({
      pathname: this.props.location.pathname,
      search: qs.stringify(Object.assign({}, query,
        value === '--' ? {} : { motif: value }
      ))
    });
  }
  render() {
    const selectVal = qs.parse(this.props.location.search).motif;
    return (
      <select
        value={selectVal || '--'}
        onChange={e => this.handleMotifChange(e)}
      >
        <option key="none" value="--">
          {selectVal ? 'All motifs' : 'Jump to motif...'}
        </option>
        {Object.keys(this.props.appState.doc).map(motif => (
          <option
            key={motif}
            value={urlifyMotif(motif)}
          >
            {motif}
          </option>
        ))}
      </select>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state
}), appActions)(Search));
