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
          entries = entries.concat({
            ...entry,
            ...getLocations(entry)
          });
          try {
            correctLastEntry(entries);
          } catch (err) {
            console.error({
              msg: 'Missing or bad location',
              content: entries[entries.length - 1].content,
            });
          }
          parseLocations(entries[entries.length - 1]);
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
          // .replace(/\([A-Z]+\)/, '')
          .trim()
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

function parseLocations(entry) {
  // console.log(entry.locations.raw);
}

// check for 'false' entries and repeat page locations
function correctLastEntry(entries) {
  const lastIdx = entries.length - 1;
  const lastEntry = entries[lastIdx];
  if (!lastEntry.locations.raw) {
    if (lastEntry.content.startsWith('——')) {
      // repeat page location
      lastEntry.locations.raw = entries[lastIdx - 1].locations.raw;
      lastEntry.locations.repeat = true;
    } else {
      // stray line break, add content to previous entry and delete last
      entries[lastIdx - 1].content += ` ${lastEntry.content}`;
      entries.splice(-1, 1);
    }
  }
}

function getLocations(entry) {
  let content = textify(entry.content);
  const locations = {};
  const pp = /^p ?p?\.? ?/;

  // pp. 204, 206
  const re1 = new RegExp(`${pp.source}([^ ,]+, )+.+? `);
  let matches = content.match(re1);
  if (matches) {
    content = content.replace(re1, '');
    // console.log('--RE1', matches[0]);
    locations.raw = matches[0];
    return { content, locations };
  }

  // pp. anne|leiris 28
  const re1a = new RegExp(`${pp.source}(anne|leiris) .+? `);
  matches = content.match(re1a);
  if (matches) {
    content = content.replace(re1a, '');
    // console.log('--RE1A', matches[0]);
    locations.raw = matches[0];
    return { content, locations };
  }

  // pp. 41-2 (60-2)
  // pp. 148-49 (212-14)
  // p. 323n (13n)
  const re1b = new RegExp(`${pp.source}[^ ]+ \\([^ \\)]\\) `);
  matches = content.match(re1b);
  if (matches) {
    content = content.replace(re1b, '');
    // console.log('--RE1B', matches[0]);
    locations.raw = matches[0];
    return { content, locations };
  }

  // pp. 94-7
  const re2 = new RegExp(`${pp.source}[^ ,]+ `);
  matches = content.match(re2);
  if (matches) {
    content = content.replace(re2, '');
    // console.log('--RE2', matches[0]);
    locations.raw = matches[0];
    return { content, locations };
  }

  return { content, locations };
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
