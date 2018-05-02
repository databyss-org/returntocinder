/* eslint-disable no-console */

import express from 'express';
import fs from 'fs';
import { indexEntries, searchEntries } from '../lib/search';
import { groupEntriesBySource, linkMotifsInEntry, makeStemDict } from '../lib/indexers';
import motifDict from '../content/motifs.json';

import hdg from '../../public/authors/hdg/entries.json';
import ka from '../../public/authors/ka/entries.json';

const router = express.Router();

const processMap = {
  'GROUP_BY_SOURCE': groupEntriesBySource
};

console.log('LINKING ENTRIES');
const entryList = JSON.parse(fs.readFileSync('./public/entries.json'));
const stemDoc = makeStemDict(motifDict);
entryList.forEach((entry) => {
  entry.linkedContent =
    linkMotifsInEntry({ content: entry.content, stemDoc }).entry;
});

console.log('INDEXING ENTRIES');
const index = indexEntries([entryList]);

console.log('INDEX COMPLETE');

router.get('/search', (req, res) => {
  const { query, processResults, withMeta, id } = req.query;

  res.status(200).json({
    id,
    results: searchEntries({
      index,
      query,
      processResults: processMap[processResults],
      withMeta,
    })
  });
});

export default router;
