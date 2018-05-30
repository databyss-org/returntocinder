/* eslint-disable no-console */

import express from 'express';
import { searchEntries } from '../lib/search';
import { list as listEntries } from '../lib/data/entries';
import { list as listMotifs } from '../lib/data/motifs';
import { list as listSources } from '../lib/data/sources';

const router = express.Router();

let motifDict;

// fetch motifs from db
listMotifs()
  .then((motifs) => {
    motifDict = motifs.reduce((dict, motif) => {
      dict[motif.id] = motif;
      return dict;
    }, {});
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

router.get('/search', async (req, res) => {
  const { query, groupBy, withMeta, id } = req.query;
  res.status(200).json({
    id,
    results: await searchEntries({
      query,
      groupBy,
      withMeta,
    })
  });
});

router.get('/motifs/:mid', async (req, res) => {
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
    sources,
  });
});

router.get('/sources/:sid', async (req, res) => {
  const entries = await listEntries({
    sourceId: req.params.sid
  });
  if (!entries.length) {
    return res.status(404).end();
  }
  return res.status(200).json(entries);
});

router.get('/sources', async (req, res) => {
  const sources = await listSources();
  return res.status(200).json(sources);
});


export default router;
