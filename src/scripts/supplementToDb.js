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
      const io = {
        stdOut: this.stdOut.bind(this),
        stdErr: this.stdErr.bind(this),
      };
      const doc = await rtfToJson({
        rtfPath,
        motifDict,
        biblio,
        ...io,
      });
      // add author to motifs
      for (const motif of Object.values(doc.motifs)) {
        await addAuthorToMotif({
          mid: motif.id,
          authorCode: doc.author,
          ...io,
        });
      }
      // add entries
      const entries = Object.values(doc.entries);
      let count = 0;
      for (const entry of entries) {
        count += 1;
        await add(entry);
      }
      this.stdOut(`Added ${count} entries`);
      this.emit('end', true);
    } catch (err) {
      this.emit('stderr', err.message);
      this.emit('end', false);
    }
  }
}

export default SupplementToDb;

if (require.main === module) {
  const batch = new SupplementToDb();
  batch.on('end', success => {
    process.exit();
  });
  batch.on('stdout', msg => {
    console.log(msg);
  });
  batch.on('stderr', msg => {
    console.error(msg);
  });
  batch.run('supplement.rtf');
}
