import React from 'react';
import { withRouter } from 'react-router';
import {
  Landing,
  LandingEntries,
  LandingSources,
  Link,
  Raw,
  ThemeProvider,
  Entry,
  EntriesByLocation,
} from '@databyss-org/ui';
import renderTemplate from 'react-text-templates';
import theme from '../../theme';

class MotifLanding extends React.Component {
  constructor(props) {
    super(props);
    this.onSourceClick = this.onSourceClick.bind(this);
    this.renderEntries = this.renderEntries.bind(this);
    this.renderSourcesToc = this.renderSourcesToc.bind(this);
    this.updateTemplates = this.updateTemplates.bind(this);
  }
  updateTemplates() {
    const { motif, cfList, meta, author, query, source } = this.props;
    this.templateTokens = {
      AUTHOR_NAME: `${author.firstName} ${author.lastName}`,
      MOTIF_NAME: motif.name,
      ENTRY_COUNT: motif.entryCount || '',
      SOURCE_COUNT: motif.sources ? motif.sources.length : 1,
      SOURCE_TITLE: source && source.title,
    };
    this.contentTitle = renderTemplate(
      meta.LANDING_SUMMARY,
      this.templateTokens
    );
    this.landingProps = {
      cfList,
      title: renderTemplate(meta.LANDING_HEADING, this.templateTokens),
      subtitle:
        meta.LANDING_SUB_HEADING &&
        renderTemplate(meta.LANDING_SUB_HEADING, this.templateTokens),
      renderCfItem: cf => (
        <Link href={`/motif/${query.resource}:${cf.id}`}>{cf.lastName}</Link>
      ),
      contentTitle: this.contentTitle,
    };
  }
  onSourceClick(href) {
    return () => this.props.history.push(href);
  }
  renderSourcesToc() {
    const { motif, query } = this.props;
    return (
      <LandingSources
        sources={motif.sources}
        renderSource={source => {
          const href = `/motif/${query.resource}/${source.id}`;
          return (
            <Link href={href} onClick={this.onSourceClick(href)}>
              <Raw
                html={`${source.title}${
                  source.entryCount ? ` (${source.entryCount})` : null
                }`}
              />
            </Link>
          );
        }}
      />
    );
  }
  renderEntries() {
    return (
      <LandingEntries>
        <EntriesByLocation
          locations={this.props.motif.entriesByLocation}
          renderEntry={entry => <Entry {...entry} />}
        />
      </LandingEntries>
    );
  }
  render() {
    const { source, showAll } = this.props;
    this.updateTemplates();
    return (
      <ThemeProvider theme={theme}>
        <Landing {...this.landingProps}>
          {source || showAll ? this.renderEntries() : this.renderSourcesToc()}
        </Landing>
      </ThemeProvider>
    );
  }
}

export default withRouter(MotifLanding);
