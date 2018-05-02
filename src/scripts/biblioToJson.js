/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import { getSource, renderPara, allMatches } from '../lib/rtfToJson';
import { defaultAuthor } from '../content/config.json';

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
    let sid = getSource(doc.content[i]);
    if (!sid) {
      continue;
    }
    sid = sid.trim();

    // capture title and citations
    const html = renderPara(doc.content[i]);
    const title = html.match(/^[^\s]*?\s+([^[]*)/)[1];
    const re = /\[(.*?)\]/g;
    const citations = allMatches(re, html, 1);
    let author = defaultAuthor;
    if (sid.match(/\./)) {
      [author] = sid.split('.');
    }

    sources[sid] = {
      id: sid,
      title,
      citations,
      author,
    };
  }

  // console.log(chapters);
  return JSON.stringify(sources);
}
