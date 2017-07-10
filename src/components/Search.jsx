import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import qs from 'query-string';
import Autosuggest from 'react-autosuggest';
import Highlighter from 'react-highlight-words';
import latinize from 'latinize';
import * as appActions from '../actions';
import theme from '../scss/search.scss';
import { textify } from '../lib/_helpers';

import CloseIcon from '../icons/close.svg';

class Search extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      searchWords: [],
      suggestions: []
    };

    this.onChange = this.onChange.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.onSuggestionHighlighted = this.onSuggestionHighlighted.bind(this);
    this.onClearInput = this.onClearInput.bind(this);
    this.renderInputComponent = this.renderInputComponent.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
  }
  componentDidMount() {
    const { motif, source } = qs.parse(this.props.location.search);
    const { doc, sourceList } = this.props.appState;

    if (motif) {
      this.setState({
        value: textify(doc[motif].title)
      });
    }
    if (source) {
      this.setState({
        value: textify(sourceList.find(s => s.id === source).name)
      });
    }
  }
  getSuggestions(value) {
    const { motifList, sourceList } = this.props.appState;
    const wordSeparator = new RegExp(/[^a-z0-9'"]/);
    const searchWords = value.trim().toLowerCase().split(wordSeparator);

    if (!searchWords.length) {
      return [];
    }

    this.setState({ searchWords });

    const matchStems = (words, queries, matchCount = 0) => {
      let found = false;
      words.forEach((w, widx) => {
        queries.forEach((q, qidx) => {
          if (w.startsWith(q) && !found) {
            const nw = words.slice(0, widx).concat(words.slice(widx + 1));
            const nq = queries.slice(0, qidx).concat(queries.slice(qidx + 1));
            matchCount = matchStems(nw, nq, matchCount + 1);
            found = true;
          }
        });
      });
      return matchCount;
    };

    const findMatches = (collection, max) => collection
      .filter(m => matchStems(
        latinize(m.name).toLowerCase().split(wordSeparator),
        searchWords
      ) === searchWords.length)
      .slice(0, max);

    const motifMatches = findMatches(motifList, 5);
    const sourceMatches = findMatches(sourceList, 2);

    return [
      ...(motifMatches.length ? [{
        title: 'Motifs',
        suggestions: motifMatches
      }] : []),
      ...(sourceMatches.length ? [{
        title: 'Sources',
        suggestions: sourceMatches
      }] : [])
    ];
  }
  getSuggestionValue(suggestion) {
    return suggestion.id;
  }
  renderSuggestion(suggestion) {
    return suggestion.type === 'motif' ? (
      <div className={theme.motifSuggestion}>
        {suggestion.name}
      </div>
    ) : (
      <div>{suggestion.display}</div>
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
      search: qs.stringify(Object.assign({}, query, {
        [suggestion.type]: suggestion.id
      }))
    });
    this.setState({
      value: textify(suggestion.name)
    });
  }
  onSuggestionHighlighted({ suggestion }) {
    if (!suggestion) { return; }

    this.setState({
      value: textify(suggestion.name)
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
    delete query.source;
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
  renderSectionTitle(section) {
    return (
      <strong>{section.title}</strong>
    );
  }
  getSectionSuggestions(section) {
    return section.suggestions;
  }
  render() {
    const { suggestions, value } = this.state;

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        onSuggestionHighlighted={this.onSuggestionHighlighted}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        renderInputComponent={this.renderInputComponent}
        renderSectionTitle={this.renderSectionTitle}
        getSectionSuggestions={this.getSectionSuggestions}
        multiSection={true}
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
