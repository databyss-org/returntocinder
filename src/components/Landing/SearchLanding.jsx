import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import shallowequal from 'shallowequal'
import {
  Landing,
  TocList,
  Link,
  BackButton,
  ForwardButton,
  ContentNav,
} from '@databyss-org/ui'
import urlencode from 'urlencode'
import _ from 'lodash'
import { Helmet } from 'react-helmet'
import appActions from '../../redux/app/actions'
import searchActions from '../../redux/search/actions'
import EntriesBySource from './../EntriesBySource.jsx'
import LoadingIcon from '../../icons/loading.svg'
import styles from '../../app.scss'

import renderTemplate from 'react-text-templates'

const { DEFAULT_AUTHOR } = process.env

class SearchLanding extends PureComponent {
  constructor(props) {
    super(props)
    this.query = props.query
    this.location = 'sources'
    this._updateRows(this.props)
    this.motifLinksActive = props.appState.motifLinksAreActive
    this.resultsMeta = {}
    // this.showAll = false
    this.state = { showAll: false }
    this.lastScroll = {
      query: null,
      hash: null,
    }
    this.setScroll = this.setScroll.bind(this)
  }

  componentWillMount() {
    document.addEventListener('keypress', this.onKeyPress.bind(this))
    this.loadSources(this.props)
  }

  componentWillUnount() {
    document.removeEventListener('keypress', this.onKeyPress.bind(this))
  }

  componentWillReceiveProps(nextProps) {
    const mofifLinksChanged =
      this.motifLinksActive === nextProps.appState.motifLinksAreActive

    const queryChanged = !shallowequal(this.query, nextProps.query)
    const resultsChanged =
      this.props.searchState.results !== nextProps.searchState.results

    if (queryChanged) {
      this.query = nextProps.query
      this.setState({ lastScroll: { query: null, path: null } })
    }

    if (!mofifLinksChanged) {
      this.motifLinksActive = nextProps.appState.motifLinksAreActive
    }

    if (queryChanged || resultsChanged || !mofifLinksChanged) {
      this._updateRows(nextProps)
    }
    // COMPARES SEARCH RESULTS AND UPDATES CACHE
    const currentAuthorList = Object.keys(nextProps.searchState.resultsMeta)
      .filter(a => a.split(':')[0] === nextProps.searchState.query)
      .map(a => a.split(':')[1])

    const objectSource = Object.keys(nextProps.searchState.resultsMeta)[0]
    const [queryID, authorID] = objectSource.split(':')
    const authorsCache = [
      authorID,
      ...nextProps.searchState.resultsMeta[objectSource].cfauthors,
    ]

    if (
      currentAuthorList.length !== 0 &&
      !_.isEqual(_.sortBy(authorsCache), _.sortBy(currentAuthorList)) &&
      !nextProps.searchState.isSourcesLoading
    ) {
      this.loadSources(nextProps)
    }

    this.checkURL(nextProps.match.params.term)
  }

  componentDidMount() {
    this.checkURL(this.props.match.params.term)
  }

  checkURL(term) {
    if (term.includes(':') && this.location !== 'author') {
      this.location = 'author'
      this._updateRows(this.props)
    }
    if (!term.includes(':') && this.location !== 'sources') {
      this.location = 'sources'
      this._updateRows(this.props)
    }
  }

  loadSources(props) {
    if (!props.match.params.term.includes(':')) {
      const resource = this.query.resource
      const term = this.query.term
      const objectSource = Object.keys(props.searchState.resultsMeta)[0]
      const [queryID, authorID] = objectSource.split(':')
      const sourceList = [
        authorID,
        ...props.searchState.resultsMeta[term].cfauthors,
      ]
      props.searchEntriesList({
        query: resource,
        authorsList: sourceList,
      })
    }
  }

  onKeyPress(e) {
    if (e.key === '/' && e.getModifierState('Control')) {
      this.props.toggleIdLinks(!this.props.appState.idLinksAreActive)
    }
  }

  setScroll(hash) {
    if (!this.props.ready) {
      return false
    }
    const scroll = { query: this.query, hash }
    if (shallowequal(this.lastScroll, scroll)) {
      return false
    }
    this.lastScroll = scroll
    return true
  }

  _updateRows(props) {
    const { entriesBySource, doc, biblio, config } = props.appState
    const { results, resultsMeta } = props.searchState
    const { term, isLinked, resource, type } = this.query
    const { path } = this.props

    this.stats = {
      search: (term, resource) => ({
        name: `Results for: ${urlencode.decode(resource)}`,
        entryCount: resultsMeta[term] ? resultsMeta[term].count : 0,
        sourceCount: resultsMeta[term]
          ? resultsMeta[term].sourceList.length
          : 0,
        authors: resultsMeta[term] ? resultsMeta[term].cfauthors : [],
      }),
    }[type](term, resource)

    const reducer = (accumulator, currentValue) =>
      accumulator + resultsMeta[currentValue].count
    const entriesCount = Object.keys(resultsMeta).reduce(reducer, 0)
    const authorCount = Object.keys(resultsMeta).length

    this._allEntries = []
    Object.keys(results).map(r => {
      Object.keys(results[r]).map(s =>
        this._allEntries.push({ author: s, entries: [...results[r][s]] })
      )
    })

    this._allRowComponent = ({ index, key }) => {
      return (
        <EntriesBySource
          sid={index.author}
          isLinked={isLinked}
          entries={index.entries}
          key={key}
          showHeader
          highlight={resource.split(/\s/)}
          path={path}
          setScroll={this.setScroll}
          showMotifNav={this.query.author === DEFAULT_AUTHOR}
        />
      )
    }

    this._rows = Object.keys(results[term])

    this._rowComponent = ({ index, key, style }) => {
      return (
        <EntriesBySource
          sid={this._rows[index]}
          isLinked={isLinked}
          entries={results[term][this._rows[index]]}
          key={key}
          style={style}
          showHeader
          highlight={resource.split(/\s/)}
          path={path}
          setScroll={this.setScroll}
          showMotifNav={this.query.author === DEFAULT_AUTHOR}
        />
      )
    }
    const authorName = props.appState.authorDict[term.split(':')[1]]
      ? `${props.appState.authorDict[term.split(':')[1]].firstName} ${
          props.appState.authorDict[term.split(':')[1]].lastName
        }`
      : ''

    const cfList = resultsMeta[term].cfauthors.map(
      a => props.appState.authorDict[a]
    )
    const allAuthors = [
      Object.keys(this.props.searchState.resultsMeta)[0].split(':')[1],
      ...this.props.searchState.resultsMeta[
        Object.keys(this.props.searchState.resultsMeta)[0]
      ].cfauthors,
    ]
      .map(a => {
        return `${this.props.appState.authorDict[a].firstName} ${
          this.props.appState.authorDict[a].lastName
        }`
      })
      .join(' ')

    let allSources = Object.keys(this.props.searchState.resultsMeta)
      .map(a => {
        return this.props.searchState.resultsMeta[a].sourceList
      })
      .reduce((acc, val) => {
        return [...acc, ...val]
      })

    allSources = this.props.appState.sourceList
      .filter(s => allSources.indexOf(s.id) > -1)
      .map(s => s.name)
      .join(' ')

    this.templateTokens = {
      AUTHOR_NAME: authorName,
      ENTRIES_COUNT: props.match.params.term.includes(':')
        ? resultsMeta[term].count
        : entriesCount,
      ENTRIES: entriesCount > 1 ? 'entries' : 'entry',
      QUERY: resource,
      SOURCES_COUNT: resultsMeta[term].sourceList.length,
      MULTIPLE_SOURCES: resultsMeta[term].sourceList.length > 1 ? 's' : ' ',
      AUTHOR_COUNT: authorCount,
      MULTIPLE_AUTHORS: authorCount > 0 ? 's' : '',
      ALL_AUTHORS_NAMES: allAuthors,
      ENTRY_COUNT: 'EEENNNNTRY',
      ALL_SOURCES: allSources,
    }

    const hasResults = !_.isEmpty(
      this.props.searchState.results[
        Object.keys(this.props.searchState.results)[0]
      ]
    )
    this.landingProps = props.match.params.term.includes(':')
      ? {
          showMotifLinks: this.motifLinksActive,
          withToggle: true,
          cfList,
          onCfListSelect: id => {
            props.history.push(`/search/${props.searchState.query}:${id}`)
          },
          onMotifLinksChange: () =>
            this.props.toggleMotifLinks(
              !this.props.appState.motifLinksAreActive
            ),
          title: renderTemplate(
            config.search_author_meta.LANDING_HEADING,
            this.templateTokens
          ),
          subtitle: renderTemplate(
            config.search_author_meta.LANDING_SUB_HEADING,
            this.templateTokens
          ),
          contentTitle: renderTemplate(
            config.search_author_meta.LANDING_SUMMARY,
            this.templateTokens
          ),
        }
      : {
          showMotifLinks: this.motifLinksActive,
          cfList: [],
          withToggle: false,
          onMotifLinksChange: () =>
            this.props.toggleMotifLinks(
              !this.props.appState.motifLinksAreActive
            ),
          title: renderTemplate(
            config.search_meta.LANDING_HEADING,
            this.templateTokens
          ),
          subtitle: '',
          contentTitle: hasResults
            ? renderTemplate(
                config.search_meta.LANDING_SUMMARY,
                this.templateTokens
              )
            : 'no results',
        }
  }

  sourceClick({ term, id }) {
    let url = `/search/${term}:${id}`
    this.props.history.push(url)
  }

  showAllClick() {
    this.setState({
      showAll: !this.state.showAll,
    })
  }

  render() {
    const hasResults = !_.isEmpty(
      this.props.searchState.results[
        Object.keys(this.props.searchState.results)[0]
      ]
    )

    this._updateRows(this.props)
    const allRows = this._allEntries.map((a, i) =>
      this._allRowComponent({ index: a, key: i })
    )

    const rows = this._rows.map((key, index) =>
      this._rowComponent({ index, key, style: {} })
    )

    let allAuthors = Object.keys(this.props.searchState.resultsMeta)
    allAuthors = allAuthors.map(a => ({
      author: a,
      count: this.props.searchState.resultsMeta[a].count,
    }))

    allAuthors.sort((a, b) => b.count - a.count)
    allAuthors = allAuthors.filter(a => a.count > 0).map(a => a.author)

    const authorsRow = allAuthors.map((a, i) => {
      const authorInfo = this.props.appState.authorDict[
        a.replace(/^[^:\r\n]+:\h*/g, '')
      ]
      return (
        <Link
          key={i}
          sourceHref={`/source/${authorInfo.lastName}`}
          onClick={() =>
            this.sourceClick({
              term: this.props.match.params.term,
              id: authorInfo.id,
            })
          }
        >
          {`${authorInfo.firstName} ${authorInfo.lastName} (${
            this.props.searchState.resultsMeta[a].count
          })`}
        </Link>
      )
    })
    return (
      <Landing {...this.landingProps}>
        {!this.props.match.params.term.includes(':') ? (
          <Helmet>
            <title>
              {renderTemplate(
                this.props.appState.config.search_meta.META_TITLE,
                this.templateTokens
              )}
            </title>

            <meta
              name='description'
              content={renderTemplate(
                this.props.appState.config.search_meta.META_DESCRIPTION,
                this.templateTokens
              )}
            />

            <meta
              name='keywords'
              content={renderTemplate(
                this.props.appState.config.search_meta.META_KEYWORDS,
                this.templateTokens
              )}
            />
          </Helmet>
        ) : (
          <Helmet>
            <title>
              {renderTemplate(
                this.props.appState.config.search_author_meta.META_TITLE,
                this.templateTokens
              )}
            </title>

            <meta
              name='description'
              content={renderTemplate(
                this.props.appState.config.search_author_meta.META_DESCRIPTION,
                this.templateTokens
              )}
            />

            <meta
              name='keywords'
              content={renderTemplate(
                this.props.appState.config.search_author_meta.META_KEYWORDS,
                this.templateTokens
              )}
            />
          </Helmet>
        )}

        {hasResults &&
          (!this.props.match.params.term.includes(':') || this.state.showAll ? (
            !this.state.showAll ? (
              <TocList>
                <ContentNav
                  right={
                    <ForwardButton
                      ariaLabel='all entries'
                      label='Show all'
                      onClick={() => {
                        this.showAllClick()
                      }}
                    />
                  }
                />
                {authorsRow}

                {this.props.searchState.isSourcesLoading && (
                  <div className={styles.loader}>
                    <LoadingIcon />
                    <p>loading</p>
                  </div>
                )}
              </TocList>
            ) : (
              <div>
                <ContentNav
                  left={
                    <BackButton
                      label='All Authors'
                      onClick={() => {
                        this.showAllClick()
                      }}
                    />
                  }
                />

                {allRows}
              </div>
            )
          ) : (
            <div>
              <ContentNav
                left={
                  <BackButton
                    label='All Authors'
                    onClick={() =>
                      this.props.history.push(
                        `/search/${this.props.searchState.query}`
                      )
                    }
                  />
                }
              />

              {rows}
            </div>
          ))}
      </Landing>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      appState: state.app,
      searchState: state.search,
    }),
    { ...appActions, ...searchActions }
  )(SearchLanding)
)
