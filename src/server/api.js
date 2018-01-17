/* eslint-disable no-console */

import express from 'express';
import fs from 'fs';
import { indexEntries, searchEntries } from '../lib/search';
import { groupEntriesBySource, linkMotifsInEntry } from '../lib/indexers';

const router = express.Router();

const processMap = {
  'GROUP_BY_SOURCE': groupEntriesBySource
};

console.log('INDEXING ENTRIES');
const entryList = JSON.parse(fs.readFileSync('./public/entries.json'));
const doc = JSON.parse(fs.readFileSync('./public/full.json'));
const linkedEntryList = entryList.map(entry => ({
  ...entry,
  content: linkMotifsInEntry({ content: entry.content, doc })
}));
const index = indexEntries(entryList);
const linkedIndex = indexEntries(linkedEntryList);
console.log('INDEX COMPLETE');

router.get('/search', (req, res) => {
  const { query, processResults, withMeta, id, getLinked } = req.query;

  res.status(200).json({
    id,
    results: searchEntries({
      index: getLinked ? linkedIndex : index,
      query,
      processResults: processMap[processResults],
      withMeta,
    })
  });
});

export default router;
