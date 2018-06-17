/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import { getSource, renderPara } from '../lib/rtfToJson';
import { getHeading, getEntries } from './docToJson';
import {
  linkMotifsInEntry,
  makeStemDict,
  sidFromSourceCode,
  motifDictFromList
} from '../lib/indexers';

function readRtf(path) {
  return new Promise((resolve, reject) => {
    parse.stream(fs.createReadStream(path), async (err, rtf) => {
      if (err) {
        return reject(err);
      }
      return resolve(rtf);
    });
  });
}

async function rtfToJson({ rtfPath, motifDict, biblio }) {
  const rtf = await readRtf(rtfPath);
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

        // merge motifs into doc.motifs
        doc.motifs = {
          ...doc.motifs,
          ...motifDictFromList(motifs)
        };

        // search and source view expect entry.motif to be array of motif objs
        entry.motif = motifs;

        // entry id must be unique across all authors
        entry.id = code + idx;
        // add to flat entry list
        doc.entries.push(entry);

        // store the linked entry in the entry
        entry.linkedContent = linkedEntry;

        idx += 1;
      }
    } while (i < rtf.content.length);
  }
  return doc;
}

export default rtfToJson;
