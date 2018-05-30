/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import childProcess from 'child_process';
import { getSource, renderPara } from '../lib/rtfToJson';
import motifDict from '../content/motifs.json';
import { getHeading, getEntries, addAuthorToMotif } from './docToJson';
import biblio from '../../public/biblio.json';
import {
  linkMotifsInEntry,
  makeStemDict,
  sidFromSourceCode,
} from '../lib/indexers';
import { add } from '../lib/data/entries';

export default function supplementToJson({ input, output }) {
  childProcess.exec('pwd', {}, (err, stdout) => console.log(stdout));
  return new Promise((resolve, fail) => {
    parse.stream(fs.createReadStream(input), async (err, rtf) => {
      if (err) {
        return fail(err);
      }

      try {
        const doc = await rtfToJson({ rtf, output });
        const entries = Object.values(doc.entries);
        for (const entry of entries) {
          await add(entry);
        }
      } catch (err) {
        return fail(err);
      }

      return resolve();
    });
  });
}

async function rtfToJson({ rtf, output }) {
  // setup return obj
  const doc = {
    entries: [],
    motifs: {},
  };
  // author should be first line
  const [code, lastName, firstName]
    = renderPara(rtf.content[0]).split(',').map(n => n.trim());
  doc.author = code;
  console.log('AUTHOR', `${code} (${firstName} ${lastName})`);

  // generate stem dict
  const stemDict = makeStemDict(motifDict);

  // readline loop
  for (let i = 1; i < rtf.content.length; i += 1) {
    // skip past source title
    const sourceTitle = getHeading(rtf.content[i]);
    if (!sourceTitle) {
      continue;
    }

    do {
      if (getHeading(rtf.content[i + 1])) {
        // end source
        break;
      }

      i += 1;
      // scan for source
      const dsid = getSource(rtf.content[i]);
      if (!dsid) {
        continue;
      }
      console.log('SOURCE', dsid);
      const sid = sidFromSourceCode(dsid);

      // capture entries
      const entries = getEntries(rtf, i);

      let idx = 0;
      for (const entry of entries) {
        entry.source = {
          display: dsid,
          id: sid,
          name: biblio[sid] && biblio[sid].name,
          author: code
        };

        // find motifs in entry and get linked Entry
        const { entry: linkedEntry, motifs } = linkMotifsInEntry({
          content: entry.content,
          stemDoc: stemDict
        });

        // search and source view expect entry.motif to be array of motif objs
        entry.motif = motifs;

        // entry id must be unique across all authors
        entry.id = code + idx;
        // add to flat entry list
        doc.entries.push(entry);

        // store the linked entry in the entry
        entry.linkedContent = linkedEntry;

        // add entry to motif
        for (const motif of motifs) {
          await addAuthorToMotif({ mid: motif.id, authorCode: code });
        }
        idx += 1;
      }
    } while (i < rtf.content.length);
  }
  return doc;
}

if (require.main === module) {
  supplementToJson({ input: '../doc/supplement.rtf', output: { public: './public', content: './src/content' } })
    .then(() => process.exit())
    .catch((err) => { console.log(err); process.exit(); });
}
