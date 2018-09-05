import { matchPath } from 'react-router';
import fs from 'fs';
import { list as listConfig } from './data/config';
import { list as listEntries } from './data/entries';
import { get as getMotif } from './data/motifs';
import { get as getSource } from './data/sources';
import { get as getAuthor } from './data/authors';
import { parseTerm } from './url';

const templateSources = {};

export const replaceTokens = (template, tokenDict) =>
  Object.keys(tokenDict).reduce(
    (str, key) => str.replace(
      new RegExp(`{${key}}`, 'g'),
      escapeQuotes(tokenDict[key])
    ),
    template
  );

export const replaceMetaTokens = (templateSource, tokenDefs, tokenValues) => {
  const tokens = Object.keys(tokenDefs).reduce(
    (dict, tokenKey) => ({
      ...dict,
      [tokenKey]:
        tokenValues
          ? replaceTokens(tokenDefs[tokenKey], tokenValues)
          : tokenDefs[tokenKey]
    }),
    {}
  );
  return replaceTokens(templateSource, tokens);
};

const getAuthorName = async (authorId) => {
  const authorRec = await getAuthor(authorId);
  return `${authorRec.firstName} ${authorRec.lastName}`;
};

const escapeQuotes = str => str.trim().replace(new RegExp('"', 'g'), '&quot;');

export const renderMetaTemplate = async ({ templatePath, requestPath }) => {
  const pattern = '/(motif|source)/:term/:filterBy?';
  const match = matchPath(requestPath, pattern);
  const config = (await listConfig())
    .reduce((dict, c) => ({ ...dict, [c.key]: c.value }), {});
  // load the template file if it's not already loaded
  if (!templateSources[templatePath]) {
    templateSources[templatePath] = fs.readFileSync(templatePath).toString();
  }
  // if we're not requesting a motif or source page, use default meta
  if (!match) {
    return replaceMetaTokens(
      templateSources[templatePath], config.default_meta
    );
  }
  // use tokens for motif or motif/source
  if (match.params[0] === 'motif') {
    if (match.params.filterBy) {
      const source = await getSource(match.params.filterBy);
      const { entryCount } = await listEntries({
        motifId: match.params.term,
        sourceId: match.params.filterBy,
        groupBy: 'source'
      });
      const motif = await getMotif(match.params.term);
      return replaceMetaTokens(
        templateSources[templatePath],
        config.source_motif_meta,
        {
          SOURCE_TITLE: source.title,
          MOTIF_NAME: motif.name,
          AUTHOR_NAME: await getAuthorName(source.author),
          ENTRY_COUNT: entryCount > 10 ? entryCount.toString() : ''
        }
      );
    }
    // parse term to handle motif:author urls
    const { author, resource } = parseTerm(match.params.term);
    const motifName = (await getMotif(resource)).name;
    return replaceMetaTokens(
      templateSources[templatePath],
      config.motif_meta,
      {
        MOTIF_NAME: motifName,
        ...(author ? { AUTHOR_NAME: await getAuthorName(author) } : {})
      }
    );
  }
  // use tokens for source
  const source = await getSource(match.params.term);
  return replaceMetaTokens(
    templateSources[templatePath],
    config.source_meta,
    {
      SOURCE_TITLE: source.title,
      AUTHOR_NAME: await getAuthorName(source.author)
    }
  );
};
