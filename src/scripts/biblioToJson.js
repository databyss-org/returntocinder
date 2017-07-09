/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import { getSource, renderPara, allMatches } from '../lib/rtfToJson';

parse.stream(fs.createReadStream('../doc/biblio.rtf'), (err, doc) => {
  if (err) {
    console.error(err);
    return;
  }
  fs.writeFile('./public/biblio.json', rtfToJson(doc));
});

function rtfToJson(doc) {
  const sources = {};

  for (let i = 0; i < doc.content.length; i += 1) {
    // scan for section
    const sid = getSource(doc.content[i]);
    if (!sid) {
      continue;
    }

    // capture title and citations
    const html = renderPara(doc.content[i]);
    const title = html.match(/^[^\s]*?\s+([^[]*)/)[1];
    const re = /\[(.*?)\]/g;
    const citations = allMatches(re, html, 1);

    sources[sid] = {
      id: sid,
      title,
      citations
    };
  }

  // console.log(chapters);
  return JSON.stringify(sources);
}
