/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import { urlify, textify } from '../lib/_helpers';
import { getSource, renderPara, sourcePattern } from '../lib/rtfToJson';

parse.stream(fs.createReadStream('../doc/full.rtf'), (err, doc) => {
  if (err) {
    console.error(err);
    return;
  }
  fs.writeFile('./public/full.json', rtfToJson(doc));
});

function rtfToJson(doc) {
  const chapters = {};
  let sections;
  let entries;

  // console.error(doc.content);

  for (let i = 0; i < doc.content.length; i += 1) {
    // scan for chapter
    const chapterTitle = getHeading(doc.content[i]);
    if (!chapterTitle) {
      continue;
    }
    sections = {};

    do {
      if (getHeading(doc.content[i + 1])) {
        // end chapter
        break;
      }

      i += 1;
      // scan for section
      const sectionTitle = getSource(doc.content[i]);
      if (!sectionTitle) {
        continue;
      }

      // capture entries
      entries = [];
      do {
        const entry = renderPara(doc.content[i]);
        if (entry) {
          const re = new RegExp(
            `^(<em>)*\\s*${sourcePattern.source.substr(1)}\\s*(</em>)*`
          );
          entries = entries.concat(entry.replace(re, '').trim());
        }
        if (getSource(doc.content[i + 1])) {
          // end section
          break;
        }
        if (getHeading(doc.content[i + 1])) {
          // end chapter
          break;
        }
        i += 1;
      } while (i < doc.content.length);
      sections[sectionTitle] = entries;
    } while (i < doc.content.length);

    const chapterTitleText = textify(chapterTitle);
    const chapterTitleUrl = urlify(chapterTitleText);

    if (!chapterTitleUrl.length) {
      continue;
    }

    chapters[urlify(chapterTitleText)] = {
      title: chapterTitle,
      sources: sections
    };
  }

  // console.log(chapters);
  return JSON.stringify(chapters);
}

function getHeading(chunk) {
  if (!chunk) {
    return false;
  }
  if (!(chunk.style.bold || (
    chunk.content && chunk.content.length && chunk.content[0].style.bold
  ))) {
    return false;
  }
  return renderPara(chunk);
}
