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
        const entry = { starred: false };
        entry.content = renderPara(doc.content[i]);
        if (entry.content) {
          if (entry.content.startsWith('*')) {
            entry.starred = true;
            entry.content = entry.content.replace(/\*{1,3}/, '');
          }
          const re = new RegExp(
            `^(<em>)*\\s*${sourcePattern.source.substr(1)}\\s*(</em>)*`
          );
          entry.content = entry.content.replace(re, '').trim();
          entries = entries.concat(entry);
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
      sections[
        sectionTitle
          .replace(/^\*{1,3}/, '')
          .replace(/\([A-Z]+\)/, '')
      ] = entries;
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
  if (!isBold(chunk)) {
    return false;
  }
  return renderPara(chunk);
}

function isBold(chunk) {
  return (
    chunk.style.bold || (
      chunk.style.font &&
      chunk.style.font.name &&
      chunk.style.font.name.match(/bold/i)
    ) ||
    chunk.content.reduce((allBold, c) =>
      allBold && c.style.font && c.style.font.name && c.style.font.name.match(/bold/i)
    , true)
  );
}
