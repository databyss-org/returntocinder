/* eslint-disable no-console, no-continue */
import fs from 'fs';

import {
  entriesFromMotifs,
  sourcesFromEntries,
  mergeEntries
} from '../lib/indexers';

const doc = JSON.parse(fs.readFileSync('./public/full.json'));
const biblio = JSON.parse(fs.readFileSync('./public/biblio.json'));

// get entries by source
const sources = sourcesFromEntries(entriesFromMotifs(doc, biblio));

// fs.writeFile('./public/bsi.json', JSON.stringify(sources.BSi.entries));
const bsi = JSON.parse(fs.readFileSync('../doc/mergetest.json'));
// const merged = mergeEntries(sources.BSi.entries, 5);
const merged = mergeEntries(bsi, 5);
console.log(`BEFORE MERGE: ${sources.BSi.entries.length} entries`)
console.log(`AFTER MERGE: ${merged.length} entries`)
// console.log(merged)
// merge for each source
// const merged = Object.keys(sources).reduce((entryList, sid) =>
//   entryList.concat(mergeEntries(sources[sid].entries, 5))
// , []);

fs.writeFile('./public/mergedEntries.json', JSON.stringify(merged));
