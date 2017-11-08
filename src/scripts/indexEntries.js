/* eslint-disable no-console, no-continue */
import fs from 'fs';

import {
  entriesFromMotifs,
  sourcesFromEntries,
  mergeEntries
} from '../lib/indexers';

export default function indexEntries({ path }) {
  const doc = JSON.parse(fs.readFileSync(`${path}/full.json`));
  const biblio = JSON.parse(fs.readFileSync(`${path}/biblio.json`));

  // get entries by source
  const allSources = sourcesFromEntries(entriesFromMotifs(doc, biblio));
  const sources = allSources;
  // const sources = { BSi: allSources.BSi };

  const t1 = new Date();
  let t2 = t1;
  let entryCount = 0;
  let mergedEntryCount = 0;
  let mergedEntries = [];

  Object.keys(sources).forEach((sid) => {
    console.log('🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊');
    console.log(sid);
    console.log(' ');

    const merged = mergeEntries(sources[sid].entries, 5);
    mergedEntries = mergedEntries.concat(merged);

    console.log(`Runtime: ${new Date() - t2}`);
    t2 = new Date();

    console.log(`BEFORE MERGE: ${sources[sid].entries.length} entries`);
    entryCount += sources[sid].entries.length;

    console.log(`AFTER MERGE: ${merged.length} entries`);
    mergedEntryCount += merged.length;

    console.log(' ');
  });

  console.log(`Total Runtime: ${new Date() - t1}`);
  console.log(`BEFORE MERGE: ${entryCount} entries`);
  console.log(`AFTER MERGE: ${mergedEntryCount} entries`);

  fs.writeFile(`${path}/entries.json`, JSON.stringify(mergedEntries));
}

if (require.main === module) {
  indexEntries({ path: process.argv[2] });
}
