import { matchPath } from 'react-router';
import fs from 'fs';
import { list as listConfig } from './data/config';
import { get as getMotif } from './data/motifs';
import { get as getSource } from './data/sources';
import { get as getAuthor } from './data/authors';
import { parseTerm } from './url';

const templateSources = {};

const replaceTokens = (templateSource, tokenDefs, tokenValues) => {
  const tokens = Object.keys(tokenDefs).reduce(
    (dict, tokenKey) => ({
      ...dict,
      [tokenKey]:
        tokenValues
          ? Object.keys(tokenValues).reduce(
            (str, vk) => str.replace(vk, tokenValues[vk]), tokenDefs[tokenKey]
          )
          : tokenDefs[tokenKey]
    }),
    {}
  );
  return Object.keys(tokens).reduce(
    (str, key) => str.replace(key, tokens[key]), templateSource
  );
};

const getAuthorName = async (authorId) => {
  const authorRec = await getAuthor(authorId);
  return `${authorRec.firstName} ${authorRec.lastName}`;
};

const metaTemplate = async ({ templatePath, requestPath }) => {
  const pattern = '/(motif|source)/(.*)/:term/:filterBy?';
  const match = matchPath(requestPath, pattern);
  const config = (await listConfig())
    .reduce((dict, c) => ({ ...dict, [c.key]: c.value }), {});
  // load the template file if it's not already loaded
  if (!templateSources[templatePath]) {
    templateSources[templatePath] = fs.readFileSync(templatePath);
  }
  // if we're not requesting a motif or source page, use default meta
  if (!match) {
    return replaceTokens(
      templateSources[templatePath], config.default_meta.value
    );
  }
  // use tokens for motif or motif/source
  if (match.params[0] === 'motif') {
    if (match.params.filterBy) {
      const motif = await getMotif(match.params.term);
      const source = await getSource(match.params.filterBy);
      return replaceTokens(
        templateSources[templatePath],
        config.source_motif_meta.value,
        {
          SOURCE_TITLE: source.title,
          MOTIF_NAME: motif.name,
          AUTHOR_NAME: getAuthorName(source.author)
        }
      );
    }
    // parse term to handle motif:author urls
    const { author, resource } = parseTerm(match.params.term);
    const motifName = (await getMotif(resource)).name;
    return replaceTokens(
      templateSources[templatePath],
      config.source_motif_meta.value,
      {
        MOTIF_NAME: motifName,
        ...(author ? { AUTHOR_NAME: getAuthorName(author) } : {})
      }
    );
  }
  // use tokens for source
  const source = await getSource(match.params.filterBy);
  return replaceTokens(
    templateSources[templatePath],
    config.source_motif_meta.value,
    {
      SOURCE_TITLE: source.title,
      AUTHOR_NAME: getAuthorName(source.author)
    }
  );
};

export default metaTemplate;
