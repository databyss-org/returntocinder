import fs from 'fs';
import { add as addSource } from '../lib/data/sources';

const sources = JSON.parse(fs.readFileSync('./public/biblio.json'));

async function addSources() {
  let count = 0;
  for (const source of Object.values(sources)) {
    await addSource(source);
    count += 1;
  }
  console.log(`Added ${count} sources.`);
}

addSources()
  .catch((err) => { console.log(err); process.exit(1); })
  .then(() => process.exit());
