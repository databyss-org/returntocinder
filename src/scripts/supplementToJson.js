/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import childProcess from 'child_process';
import { linkMotifsInEntry, makeStemDict } from '../lib/indexers';
import { getSource, renderPara } from '../lib/rtfToJson';
import motifDict from '../content/motifs.json';
import { getHeading, getEntries, addAuthorToMotifs } from './docToJson';

export default function supplementToJson({ input, output }) {
  childProcess.exec('pwd', {}, (err, stdout) => console.log(stdout));
  // console.log('SUPPLEMENT2JSON', input);
  return new Promise((resolve, fail) => {
    parse.stream(fs.createReadStream(input), (err, rtf) => {
      if (err) {
        fail(err);
        return;
      }
      const doc = rtfToJson({ rtf, output });
      Object.keys(doc.entries).forEach((mid) => {
        const path = `${output.public}/authors/${doc.author.toLowerCase()}`;

        if (!fs.existsSync(path)) {
          fs.mkdirSync(path);
          fs.mkdirSync(`${path}/motifs`);
        }

        fs.writeFileSync(`${path}/motifs/${mid}.json`, JSON.stringify(doc.entries[mid]));
      });
      resolve();
    });
  });
}

function rtfToJson({ rtf, output }) {
  // setup return obj
  const doc = {
    entries: {},
    linked: {}
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
      const sid = getSource(rtf.content[i]);
      if (!sid) {
        continue;
      }
      console.log('SOURCE', sid);

      // capture entries
      const entries = getEntries(rtf, i);
      entries.forEach((entry) => {
        entry.source = { id: sid };

        // find motifs in entry and get linked Entry
        const { entry: linkedEntry, motifs } = linkMotifsInEntry({
          content: entry.content,
          stemDoc: stemDict
        });

        // store the linked entry in the entry
        entry.linkedContent = linkedEntry;

        // add entry to motif
        motifs.forEach((motif) => {
          console.log('MOTIF', motif.id);
          // create the motif if it doesn't exist
          if (!doc.entries[motif.id]) {
            doc.entries[motif.id] = {
              title: motif.name,
              sources: {
                [sid]: [],
              },
              entryCount: 0,
            };
            // add author to cfauthors list in other motifs
            addAuthorToMotifs({ mid: motif.id, authorCode: code, output });
          }
          // create the source if it doesn't exist
          if (!doc.entries[motif.id].sources[sid]) {
            doc.entries[motif.id].sources[sid] = [];
          }
          // add the entry and increment the count
          doc.entries[motif.id].sources[sid].push(entry);
          doc.entries[motif.id].entryCount += 1;
        });
      });
    } while (i < rtf.content.length);
  }
  return doc;
}

if (require.main === module) {
  supplementToJson({ input: '../doc/supplement.rtf', output: { public: './public', content: './src/content' } });
}
