import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import qs from 'query-string';
import Autosuggest from 'react-autosuggest';
import * as appActions from '../actions';
import theme from '../scss/search.scss';
import { textifyMotif } from '../lib/_helpers';

import CloseIcon from '../icons/close.svg';

class Search extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: []
    };

    this.onChange = this.onChange.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.onClearInput = this.onClearInput.bind(this);
    this.renderInputComponent = this.renderInputComponent.bind(this);
  }
  componentDidMount() {
    const { motif } = qs.parse(this.props.location.search);
    if (motif) {
      this.setState({
        value: textifyMotif(this.props.appState.doc[motif].title)
      });
    }
  }
  getSuggestions(value) {
    const { doc } = this.props.appState;
    const val = value.trim().toLowerCase();
    const regex = new RegExp(val);

    return val.length
      ? Object.keys(doc)
        .filter(m => doc[m].title.toLowerCase().match(regex))
        .map(m => ({ id: m, name: doc[m].title }))
      : [];
  }
  getSuggestionValue(suggestion) {
    return suggestion.id;
  }
  renderSuggestion(suggestion) {
    return (
      <div dangerouslySetInnerHTML={{ __html: suggestion.name }} />
    );
  }
  onChange(event, { newValue }) {
    if (newValue === '') {
      this.onClearInput();
    }
    this.setState({
      value: newValue
    });
  }
  onSuggestionSelected(event, { suggestion }) {
    const query = qs.parse(this.props.location.search);

    this.props.history.push({
      pathname: this.props.location.pathname,
      search: qs.stringify(Object.assign({}, query, { motif: suggestion.id }))
    });
    this.setState({
      value: textifyMotif(suggestion.name)
    });
  }
  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }
  onClearInput() {
    const query = qs.parse(this.props.location.search);
    delete query.motif;
    this.props.history.push({
      pathname: this.props.location.pathname,
      search: qs.stringify(query)
    });
    this.setState({
      value: ''
    });
  }
  renderInputComponent(inputProps) {
    return (
      <div>
        <input className={theme.input} {...inputProps} />
        <button
          className={theme.clear}
          onClick={this.onClearInput}
          style={{ opacity: this.state.value ? 1 : 0 }}
        >
          <CloseIcon />
        </button>
      </div>
    );
  }
  render() {
    const { suggestions, value } = this.state;

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        renderInputComponent={this.renderInputComponent}
        inputProps={{
          placeholder: 'Search for motif, source or phrase',
          value,
          onChange: this.onChange
        }}
        theme={theme}
      />
    );
  }
}

export default withRouter(connect(state => ({
  appState: state
}), appActions)(Search));
