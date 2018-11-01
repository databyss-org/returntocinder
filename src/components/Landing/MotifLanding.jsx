import React from 'react';
import {
  Landing,
  LandingSources,
  Link,
  Raw,
  ThemeProvider,
} from '@databyss-org/ui';
import renderTemplate from 'react-text-templates';
import theme from '../../theme';

export default ({ motif, cfList, meta, author, query }) => {
  const templateTokens = {
    AUTHOR_NAME: `${author.firstName} ${author.lastName}`,
    MOTIF_NAME: motif.name,
    ENTRY_COUNT: motif.entryCount || '',
    SOURCE_COUNT: motif.sources.length,
  };
  const contentTitle = renderTemplate(meta.LANDING_SUMMARY, templateTokens);
  const landingProps = {
    cfList,
    title: renderTemplate(meta.LANDING_HEADING, templateTokens),
    renderCfItem: cf => (
      <Link href={`/motif/${query.resource}:${cf.id}`}>{cf.lastName}</Link>
    ),
    contentTitle,
    // 'Databyss includes 210 entries of the motif “ABYSS” from 44 sources by Jacques Derrida',
  };
  return (
    <ThemeProvider theme={theme}>
      <Landing {...landingProps}>
        <LandingSources
          sources={motif.sources}
          renderSource={source => (
            <Link href={`/motif/abyss/${source.id}`}>
              <Raw
                html={`${source.title}${
                  source.entryCount ? ` (${source.entryCount})` : null
                }`}
              />
            </Link>
          )}
        />
      </Landing>
    </ThemeProvider>
  );
};
