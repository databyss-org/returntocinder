/* eslint-disable no-console, no-continue */
import ServerProcess from '../lib/ServerProcess';
import { add } from '../lib/data/entries';
import { list as listMotifs } from '../lib/data/motifs';
import { list as listSources } from '../lib/data/sources';
import rtfToJson from './rtfToJson';
import { motifDictFromMotifs, biblioFromSources } from '../lib/indexers';
import { addAuthorToMotif } from './docToJson';

const { UPLOADS_PATH } = process.env;

class SupplementToDb extends ServerProcess {
  async run(filename) {
    const rtfPath = `${UPLOADS_PATH}/${filename}`;
    const motifDict = motifDictFromMotifs(await listMotifs());
    const biblio = biblioFromSources(await listSources());
    try {
      const doc = await rtfToJson({ rtfPath, motifDict, biblio });
      // add author to motifs
      for (const motif of Object.values(doc.motifs)) {
        await addAuthorToMotif({ mid: motif.id, authorCode: doc.author });
      }
      // add entries
      const entries = Object.values(doc.entries);
      for (const entry of entries) {
        await add(entry);
      }
      this.emit('end', true);
    } catch (err) {
      this.emit('stderr', err);
      this.emit('end', false);
    }
  }
}

export default SupplementToDb;

if (require.main === module) {
  const batch = new SupplementToDb();
  batch.on('end', (success) => {
    process.exit();
  });
  batch.on('stdout', (msg) => {
    console.log(msg);
  });
  batch.on('stderr', (msg) => {
    console.error(msg);
  });
  batch.run('../doc/supplement.rtf');
}
