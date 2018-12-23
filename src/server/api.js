/* eslint-disable no-console */

import express from 'express';
import { searchEntries } from '../lib/search';
import { list as listEntries } from '../lib/data/entries';
import {
  list as listMotifs,
  bySource as motifsBySource,
} from '../lib/data/motifs';
import {
  list as listSources,
  byMotif as sourcesByMotif,
} from '../lib/data/sources';
import { list as listAuthors } from '../lib/data/authors';
import { list as listConfig } from '../lib/data/config';
import { get as getPage } from '../lib/data/pages';
import { get as getMenu } from '../lib/data/menus';
import { motifDictFromList, entriesByLocation } from '../lib/indexers';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { query, groupBy, withMeta, id, author } = req.query;
  const results = await searchEntries({
    query,
    groupBy,
    withMeta,
    author,
  });
  res.status(200).json({
    id,
    results,
  });
});

router.get('/motifs/:mid', async (req, res) => {
  const motifDict = motifDictFromList(await listMotifs());
  const motif = motifDict[req.params.mid];
  if (!motif) {
    return res.status(404).end();
  }
  const sources = await sourcesByMotif({
    motifId: req.params.mid,
    author: req.query.author,
  });
  return res.status(200).json({
    ...motif,
    sources,
    entryCount: sources.reduce((sum, src) => sum + src.entryCount, 0),
  });
});

router.get('/motifs/:mid/_all', async (req, res) => {
  const motifDict = motifDictFromList(await listMotifs());
  const motif = motifDict[req.params.mid];
  if (!motif) {
    return res.status(404).end();
  }
  const { sources, entryCount } = await listEntries({
    motifId: req.params.mid,
    author: req.query.author,
    groupBy: 'source',
  });
  return res.status(200).json({
    ...motif,
    entryCount,
    sources: Object.values(sources).reduce(
      (entries, source) =>
        entries.concat({
          name: source[0].source.name,
          display: source[0].source.display,
          id: source[0].source.id,
          locations: entriesByLocation(source),
          entryCount: source.length,
        }),
      []
    ),
  });
});

router.get('/motifs/:mid/:sid', async (req, res) => {
  const motifDict = motifDictFromList(await listMotifs());
  const motif = motifDict[req.params.mid];
  if (!motif) {
    return res.status(404).end();
  }
  const { sources, entryCount } = await listEntries({
    motifId: req.params.mid,
    sourceId: req.params.sid,
    author: req.query.author,
    groupBy: 'source',
  });

  return res.status(200).json({
    ...motif,
    entryCount,
    entriesByLocation: entriesByLocation(sources[req.params.sid]),
  });
});

router.get('/sources/:sid', async (req, res) => {
  const entries = await listEntries({
    sourceId: req.params.sid,
  });
  if (!entries.length) {
    return res.status(404).end();
  }
  return res.status(200).json(entries);
  // const motifs = await motifsBySource({
  //   sourceId: req.params.sid,
  // });
  // if (!motifs.length) {
  //   return res.status(404).end();
  // }
  // return res.status(200).json(motifs);
});

router.get('/sources/:sid/_all', async (req, res) => {
  const entries = await listEntries({
    sourceId: req.params.sid,
  });
  if (!entries.length) {
    return res.status(404).end();
  }
  return res.status(200).json(entries);
});

router.get('/pages/:path', async (req, res) => {
  try {
    const content = await getPage(req.params.path);
    return res.status(200).json(content);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
});

router.get('/menus/:path', async (req, res) => {
  try {
    const menu = await getMenu(req.params.path);
    return res.status(200).json(menu);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
});

router.get('/config', async (req, res) => {
  try {
    const config = await listConfig();
    return res.status(200).json(config);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
});

router.get('/sources', async (req, res) => {
  const sources = await listSources();
  return res
    .status(200)
    .json(sources.map(src => ({ ...src, name: src.title, display: src.id })));
});

router.get('/authors', async (req, res) => {
  const authors = await listAuthors();
  return res.status(200).json(authors);
});

router.get('/motifs', async (req, res) => {
  const motifs = await listMotifs();
  return res.status(200).json(motifs);
});

router.post('/admin/dumptobeta', (req, res) => {
  const { API_ADMIN_TOKEN } = process.env;
  if (req.get('Authorization') !== API_ADMIN_TOKEN) {
    req.status(403).end();
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Disposition': 'attachment; filename="stream.txt"',
  });
  const dump = new DumpDbToBeta();
  dump.on('end', () => {
    console.log('END');
    res.end();
  });
  dump.on('stdout', msg => {
    console.log(msg);
    res.write(msg);
  });
  dump.on('stderr', msg => {
    console.error(msg);
    res.write(msg);
  });
  dump.run();
});

export default router;
