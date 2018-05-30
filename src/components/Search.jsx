/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import latinize from 'latinize';
import pluralize from 'pluralize';
import _ from 'lodash';
import { motifListFromDict } from '../lib/indexers';
import searchActions from '../redux/search/actions';
import appActions from '../redux/app/actions';
import theme from '../app.scss';
import { textify } from '../lib/_helpers';

import CloseIcon from '../icons/close.svg';

class Search extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      highlightedSuggestion: null,
      searchWords: [],
      suggestions: [],
    };

    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSuggestionsFetchRequested = _.debounce(
      this.onSuggestionsFetchRequested.bind(this),
      300, { leading: true, trailing: true }
    );
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.onSuggestionHighlighted = this.onSuggestionHighlighted.bind(this);
    this.onClearInput = this.onClearInput.bind(this);
    this.renderInputComponent = this.renderInputComponent.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
    this.renderSuggestionsContainer = this.renderSuggestionsContainer.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
  }
  componentDidMount() {
    const { motif, source } = this.props.match.params;
    const { doc, sourceList } = this.props.appState;

    if (motif) {
      this.setState({
        value: textify(doc[motif].name)
      });
    }
    if (source) {
      this.setState({
        value: textify(sourceList.find(s => s.id === source).name)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { queryMeta } = this.props.searchState;
    if (queryMeta.count !== nextProps.searchState.queryMeta.count) {
      this.onSuggestionsFetchRequested({ value: this.state.value });
    }
  }
  setQuery(query) {
    this.props.setQuery(query);
  }
  getQuery() {
    return this.props.searchState.query;
  }
  getSuggestions(value) {
    if (!value) {
      return [{ suggestions: [] }];
    }
    const { sourceList } = this.props.appState;
    const wordSeparator = new RegExp(/[^a-z0-9'"]/);
    const searchWords = value.trim().toLowerCase().split(wordSeparator);

    if (!searchWords.length || searchWords[0] === '') {
      return [{ suggestions: [] }];
    }

    this.setState({ searchWords });

    const matchStems = (words, queries, matchCount = 0) => {
      let found = false;
      words.forEach((w, widx) => {
        queries.forEach((q, qidx) => {
          if (w.startsWith(q) && !found) {
            // remove term found from queries and words
            // then recurse on remaining terms/queries
            const nw = words.slice(0, widx).concat(words.slice(widx + 1));
            const nq = queries.slice(0, qidx).concat(queries.slice(qidx + 1));
            matchCount = matchStems(nw, nq, matchCount + 1);
            found = true;
          }
        });
      });
      return matchCount;
    };

    // filter collection
    const findMatches = collection => collection
      .filter(m => matchStems(
        latinize(m.name).toLowerCase().split(wordSeparator),
        searchWords
      // only pass when all query terms are matched
      ) === searchWords.length);

    // sort matches so that results starting with query are prioritized
    const sortMatches = collection => collection
      .sort((a, b) => {
        if (a.name.toLowerCase().startsWith(searchWords[0].toLowerCase())
        && !b.name.toLowerCase().startsWith(searchWords[0].toLowerCase())) {
          return -1;
        }
        if (b.name.toLowerCase().startsWith(searchWords[0].toLowerCase())
        && !a.name.toLowerCase().startsWith(searchWords[0].toLowerCase())) {
          return 1;
        }
        return 0;
      });

    const trimTo = max => c => c.slice(0, max);

    const compile = ({ collection, match, sort, filter, trim }) => {
      let res = collection;
      if (filter) {
        res = filter(res);
      }
      if (match) {
        res = match(res);
      }
      if (sort) {
        res = sort(res);
      }
      if (trim) {
        res = trim(res);
      }
      return res.map((r, idx) => { r.idx = idx; return r; });
    };

    const compileDefaults = {
      match: findMatches,
      sort: sortMatches,
    };

    const motifMatches = compile({
      ...compileDefaults,
      collection: this.props.appState.motifList.map(
        m => ({ ...m, type: 'motif' })
      ),
      filter: c => c.map(m => ({
        ...m,
        name: m.name.replace(/\(.+?[a-z]+.+?\)/, '')
      })),
      trim: trimTo(5)
    });

    const sourceMatches = compile({
      ...compileDefaults,
      collection: sourceList,
      trim: trimTo(5)
    });

    return [
      {
        suggestions: [
          {
            type: 'entry',
            count: this.props.searchState.resultCount
          }
        ]
      },
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
  renderSuggestionsContainer({ containerProps, children, query }) {
    const props = {
      ...containerProps,
      className: cx(containerProps.className, this.props.withMaskClassName)
    };
    return (
      <div {...props}>
        <div className={cx(theme.instructions, {
          [theme.show]: !this.state.value.length
        })}>
          Search by word, phrase, name, motif, or source text
        </div>
        {children}
      </div>
    );
  }
  renderSuggestion(suggestion) {
    return {
      motif: (
        <div
          className={cx(theme.motifSuggestion, theme[`row${suggestion.idx}`])}
          dangerouslySetInnerHTML={{ __html: suggestion.name }}
        />
      ),
      source: (
        <div className={cx(theme.sourceSuggestion, theme[`row${suggestion.idx}`])}>
          {suggestion.display}
        </div>
      ),
      entry: (
        <div className={theme.searchEntryContainer}>
          <div className={theme.query}>
            {this.getQuery()}
            <span>[PRESS&nbsp;ENTER]</span>
          </div>
          <div className={theme.resultCount}>
            {this.props.searchState.queryMeta.count}&nbsp;
            {pluralize('result', this.props.searchState.queryMeta.count)}
          </div>
        </div>
      )
    }[suggestion.type];
  }
  onChange(event, { newValue, method }) {
    if (newValue === '') {
      this.onClearInput();
    }
    if (newValue && method === 'type') {
      this.setState({
        value: newValue
      });
      this.setQuery(newValue);
    }
  }
  onBlur() {
    this.inputElement.blur();
  }
  onFocus() {
    this.props.toggleSearchIsFocused(this.inputElement);
  }
  onSuggestionSelected(event, { suggestion }) {
    if (suggestion.type === 'entry') {
      this.onSearch(`/search/${this.state.value}`);
    } else {
      this.onSearch(`/${suggestion.type}/${suggestion.id}`);
    }
  }
  onSuggestionHighlighted({ suggestion }) {
    if (!suggestion) { return; }

    this.setState({
      highlightedSuggestion: suggestion
    });
  }
  onSuggestionsFetchRequested({ value, reason }) {
    if (reason === 'input-focused') {
      // this.props.showMask(true);
    }
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }
  onClearInput(andClose) {
    this.setState({
      value: '',
      highlightedSuggestion: null,
    });
    if (andClose) {
      this.props.maskClicked();
    }
  }
  onSearch(path) {
    this.props.history.push({
      pathname: path,
    });
    this.onClearInput();
    this.props.maskClicked();
    this.inputElement.blur();
  }
  onKeyDown(event) {
    if (event.key === 'Enter' && !this.state.highlightedSuggestion) {
      this.onSearch(`/search/${this.getQuery()}`);
    }
  }
  renderInputComponent(inputProps) {
    return [
      <input className={theme.input} {...inputProps} key={0} />,
      <button key={1}
        className={cx(theme.clear, {
          [theme.show]: this.props.appState.search.isFocused
        })}
        onClick={() => this.onClearInput(true)}
      >
        <CloseIcon />
      </button>
    ];
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
    const { isVisible } = this.props.appState.search;

    return (
      <Transition
        in={isVisible}
        timeout={200}
        onEntered={() => this.inputElement.focus()}
      >
        {(state) => {
          return (
            <div className={cx(theme.search, {
              [theme.entering]: state === 'entering',
              [theme.entered]: state === 'entered',
              [theme.withMenu]: this.props.withMenu
            })}>
              <Autosuggest
                suggestions={suggestions}
                alwaysRenderSuggestions={true}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                onSuggestionHighlighted={this.onSuggestionHighlighted}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                renderSuggestionsContainer={this.renderSuggestionsContainer}
                renderInputComponent={this.renderInputComponent}
                renderSectionTitle={this.renderSectionTitle}
                getSectionSuggestions={this.getSectionSuggestions}
                focusInputOnSuggestionClick={false}
                multiSection={true}
                inputProps={{
                  placeholder: 'Search',
                  value,
                  onChange: this.onChange,
                  onBlur: this.onBlur,
                  onFocus: this.onFocus,
                  onKeyDown: this.onKeyDown
                }}
                ref={(autosuggest) => {
                  if (!autosuggest) { return; }
                  this.autosuggest = autosuggest;
                  this.inputElement = autosuggest.input;
                }}
                theme={theme}
              />
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), { ...appActions, ...searchActions })(Search));
