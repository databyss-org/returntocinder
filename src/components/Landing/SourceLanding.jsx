import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Landing, Entry, EntriesBySource } from '@databyss-org/ui'
import renderTemplate from 'react-text-templates'
import { Helmet } from 'react-helmet'
import actions from '../../redux/app/actions'

class SourceLanding extends React.Component {
  constructor(props) {
    super(props)
    this.onMotifLinksChange = this.onMotifLinksChange.bind(this)
  }
  updateTemplates() {
    const {
      query,

      app,
    } = this.props

    const stats = {
      source: term => ({
        name: app.biblio[term].title,
        entryCount: app.entriesBySource[term].length,
      }),
    }[query.type](query.term, query.resource)

    this.templateTokens = {
      AUTHOR_NAME: `${app.authorDict[query.author].firstName} ${
        app.authorDict[query.author].lastName
      }`,
      SOURCE_TITLE: stats.name,
      ENTRY_COUNT: stats.entryCount,
    }

    let metaInfo = {
      title: '{SOURCE_TITLE}',
      subtitle: '{AUTHOR_NAME}',
      contentTitle:
        'Databyss includes {ENTRY_COUNT} entries from {AUTHOR_NAME}\'s "{SOURCE_TITLE}"',
    }

    this.landingProps = {
      isSource: true,
      showMotifLinks: this.props.app.motifLinksAreActive,
      withToggle: true,
      onMotifLinksChange: this.onMotifLinksChange,
      title: renderTemplate('{SOURCE_TITLE}', this.templateTokens),
      subtitle: renderTemplate('{AUTHOR_NAME}', this.templateTokens),
      contentTitle: renderTemplate(metaInfo.contentTitle, this.templateTokens),
    }
  }

  onMotifLinksChange(checked) {
    this.props.toggleMotifLinks(checked)
  }

  renderEntries() {
    const { entriesBySource } = this.props.app

    const { source, term, isLinked } = this.props.query

    const renderEntry = entry => {
      return (
        <Entry
          content={entry.content}
          source={entry}
          location={entry.location}
        />
      )
    }

    if (source) {
      this._rows = [term]
      const sourceEntries = entriesBySource[term]
      const entries = {
        title: sourceEntries[0].source.name,
        display: sourceEntries[0].source.display,
        locations: sourceEntries.map(e => {
          return {
            raw: e.locations.raw,
            entries: [
              {
                content: !isLinked ? e.content : e.linkedContent,
                starred: e.starred,
              },
            ],
          }
        }),
      }
      return (
        <EntriesBySource
          sources={[entries]}
          renderEntry={entry => (
            <Entry
              onSourceClick={() => {
                this.props.history.push(`#source:${term}`)
                this.props.toggleSourceModal(term)
              }}
              href={`/source/${term}`}
              {...entry}
            />
          )}
        />
      )
    }
  }

  render() {
    let entryRender = this.renderEntries()

    this.updateTemplates()

    return (
      <Landing {...this.landingProps}>
        <Helmet>
          {/*
          <title>{renderTemplate(META_TITLE, this.textOnlyTokens)}</title>
          <meta
            name='description'
            content={renderTemplate(META_DESCRIPTION, this.textOnlyTokens)}
          />
          <meta
            name='keywords'
            content={renderTemplate(META_KEYWORDS, this.textOnlyTokens)}
          />
          */}
        </Helmet>

        {entryRender}
      </Landing>
    )
  }
}

export default compose(
  connect(
    state => state,
    actions
  ),
  withRouter
)(SourceLanding)
