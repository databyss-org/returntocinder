/* eslint-disable no-console */

import express from 'express';
import DumpDbToBeta from '../scripts/dumpDbToBeta';
import { searchEntries } from '../lib/search';
import { list as listEntries, removeBySource } from '../lib/data/entries';
import {
  list as listMotifs,
  bySource as motifsBySource,
} from '../lib/data/motifs';
import {
  list as listSources,
  byMotif as sourcesByMotif,
  add as addSource,
  get as getSource,
  update as updateSource,
  remove as removeSource,
} from '../lib/data/sources';
import {
  list as listAuthors,
  add as addAuthor,
  get as getAuthor,
  update as updateAuthor,
  remove as removeAuthor,
} from '../lib/data/authors';
import { list as listConfig } from '../lib/data/config';
import { get as getPage } from '../lib/data/pages';
import { get as getMenu } from '../lib/data/menus';
import { motifDictFromList, entriesByLocation } from '../lib/indexers';
import {
  createAdminToken,
  getAdminTokenTtlMs,
  isAdminAuthConfigured,
  requireAdminToken,
  validateAdminPassword,
} from './adminAuth';

const router = express.Router();

const normalizeSourcePayload = (payload = {}) => {
  const source = {
    id: (payload.id || '').trim(),
    title: payload.title || payload.name || '',
    author: (payload.author || '').trim(),
    citations: Array.isArray(payload.citations)
      ? payload.citations.map(c => `${c}`.trim()).filter(Boolean)
      : `${payload.citations || ''}`
          .split(/\r?\n/)
          .map(c => c.trim())
          .filter(Boolean),
  };
  source.name = source.title;
  return source;
};

const normalizeAuthorPayload = (payload = {}) => ({
  id: (payload.id || '').trim(),
  firstName: (payload.firstName || '').trim(),
  lastName: (payload.lastName || '').trim(),
});

router.post('/admin/login', (req, res) => {
  if (!isAdminAuthConfigured()) {
    return res.status(503).json({ error: 'admin auth not configured' });
  }

  const { password } = req.body || {};
  if (!validateAdminPassword(password)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const expiresAt = Date.now() + getAdminTokenTtlMs();
  return res.status(200).json({
    token: createAdminToken(),
    expiresAt,
  });
});

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

router.post('/admin/dumptobeta', requireAdminToken, (req, res) => {
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

router.get('/admin/sources', requireAdminToken, async (req, res) => {
  const sources = await listSources();
  const sorted = sources.sort((a, b) => (a.id < b.id ? -1 : 1));
  return res.status(200).json(sorted);
});

router.post('/admin/sources', requireAdminToken, async (req, res) => {
  const source = normalizeSourcePayload(req.body);
  if (!source.id || !source.title) {
    return res.status(400).json({ error: 'id and title are required' });
  }

  try {
    await getSource(source.id);
    return res.status(409).json({ error: 'source already exists' });
  } catch (err) {
    await addSource(source);
    return res.status(201).json(source);
  }
});

router.put('/admin/sources/:sid', requireAdminToken, async (req, res) => {
  const source = normalizeSourcePayload({ ...req.body, id: req.params.sid });
  if (!source.title) {
    return res.status(400).json({ error: 'title is required' });
  }

  await updateSource(req.params.sid, source);
  return res.status(200).json(source);
});

router.delete('/admin/sources/:sid', requireAdminToken, async (req, res) => {
  await removeBySource(req.params.sid);
  await removeSource(req.params.sid);
  return res.status(204).end();
});

router.get('/admin/authors', requireAdminToken, async (req, res) => {
  const authors = await listAuthors();
  const sorted = authors.sort((a, b) => {
    const lastA = (a.lastName || '').toLowerCase();
    const lastB = (b.lastName || '').toLowerCase();
    if (lastA === lastB) {
      return (a.firstName || '').toLowerCase() > (b.firstName || '').toLowerCase() ? 1 : -1;
    }
    return lastA > lastB ? 1 : -1;
  });
  return res.status(200).json(sorted);
});

router.post('/admin/authors', requireAdminToken, async (req, res) => {
  const author = normalizeAuthorPayload(req.body);
  if (!author.id || !author.lastName) {
    return res.status(400).json({ error: 'id and lastName are required' });
  }

  try {
    await getAuthor(author.id);
    return res.status(409).json({ error: 'author already exists' });
  } catch (err) {
    await addAuthor(author);
    return res.status(201).json(author);
  }
});

router.put('/admin/authors/:aid', requireAdminToken, async (req, res) => {
  const author = normalizeAuthorPayload({ ...req.body, id: req.params.aid });
  if (!author.lastName) {
    return res.status(400).json({ error: 'lastName is required' });
  }

  await updateAuthor(req.params.aid, author);
  return res.status(200).json(author);
});

router.delete('/admin/authors/:aid', requireAdminToken, async (req, res) => {
  await removeAuthor(req.params.aid);
  return res.status(204).end();
});

export default router;
