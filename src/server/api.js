/* eslint-disable no-console */

import express from 'express';
import fs from 'fs';
import { indexEntries, searchEntries } from '../lib/search';
import { groupEntriesBySource, linkMotifsInEntry, makeStemDict } from '../lib/indexers';

const router = express.Router();

const processMap = {
  'GROUP_BY_SOURCE': groupEntriesBySource
};

console.log('LINKING ENTRIES');
const entryList = JSON.parse(fs.readFileSync('./public/entries.json'));
const doc = JSON.parse(fs.readFileSync('./public/full.json'));
const stemDoc = makeStemDict(Object.keys(doc));
entryList.forEach((entry) => {
  entry.linkedContent =
    linkMotifsInEntry({ content: entry.content, stemDoc }).entry;
});

console.log('INDEXING ENTRIES');
const index = indexEntries(entryList);

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
