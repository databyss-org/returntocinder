import { createIndex as indexEntries } from '../lib/data/entries';
import { createIndex as indexMotifs } from '../lib/data/motifs';

async function indexEntriesAndMotifs() {
  await indexEntries();
  await indexMotifs();
}

indexEntriesAndMotifs()
  .catch((err) => { console.log(err); process.exit(1); })
  .then(() => process.exit());
