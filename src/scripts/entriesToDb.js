import fs from 'fs';
import { add as addEntry } from '../lib/data/entries';
import { add as addMotif } from '../lib/data/motifs';
import {
  makeStemDict,
  motifDictFromMotifs,
  linkMotifsInEntry
} from '../lib/indexers';

const entries = JSON.parse(fs.readFileSync('./public/entries.json'));
const full = JSON.parse(fs.readFileSync('./public/full.json'));
const motifs = {};

async function addEntries() {
  const motifDict = motifDictFromMotifs(full);
  const stemDoc = makeStemDict(motifDict);
  let count = 0;
  for (const entry of entries) {
    // add motifs to dict
    entry.motif.forEach((motif) => {
      motifs[motif.id] = {
        name: motif.title,
        id: motif.id,
      };
    });

    // add entry to db
    await addEntry({
      ...entry,
      linkedContent:
        linkMotifsInEntry({ content: entry.content, stemDoc }).entry,
      motif: entry.motif.map(m => ({
        name: m.title,
        id: m.id
      })),
      source: {
        ...entry.source,
        author: 'DD',
      }
    });
    count += 1;
  }
  console.log(`Added ${count} entries.`)
}

async function addMotifs() {
  let count = 0;
  for (const motif of Object.values(motifs)) {
    await addMotif(motif);
    count += 1;
  }
  console.log(`Added ${count} motifs.`);
}

async function addEntriesAndMotifs() {
  await addEntries();
  await addMotifs();
}

addEntriesAndMotifs()
  .catch((err) => { console.log(err); process.exit(1); })
  .then(() => process.exit());
