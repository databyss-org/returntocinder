import { reset as resetEntries } from '../lib/data/entries';
import { reset as resetMotifs } from '../lib/data/motifs';

async function reset() {
  await resetEntries();
  await resetMotifs();
}

reset()
  .then(() => process.exit())
  .catch((err) => { console.log(err); process.exit(1); });
