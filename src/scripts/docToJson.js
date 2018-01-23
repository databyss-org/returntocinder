/* eslint-disable no-console, no-continue */
import fs from 'fs';
import parse from 'rtf-parser';
import roman from 'roman-numerals';
import childProcess from 'child_process';
import { motifNamesFromMotifs, linkMotifsInAllEntries } from '../lib/indexers';
import { urlify, textify, simplify } from '../lib/_helpers';
import { getSource, renderPara, sourcePattern } from '../lib/rtfToJson';

export default function docToJson({ input, output }) {
  childProcess.exec('pwd', {}, (err, stdout) => console.log(stdout));
  console.log('DOC2JSON', input);
  return new Promise((resolve, fail) => {
    parse.stream(fs.createReadStream(input), (err, doc) => {
      if (err) {
        fail(err);
        return;
      }
      const full = rtfToJson(doc);
      fs.writeFileSync(`${output.public}/full.json`, JSON.stringify(full));
      fs.writeFileSync(`${output.content}/motifs.json`, JSON.stringify(motifNamesFromMotifs(full)));
      Object.keys(full).forEach((mid) => {
        fs.writeFileSync(`${output.public}/motifs/${mid}.json`, JSON.stringify(full[mid]));
        fs.writeFileSync(
          `${output.public}/motifs/${mid}-linked.json`,
          JSON.stringify(linkMotifsInAllEntries({ motif: full[mid], doc: full }))
        );
      });
      resolve();
    });
  });
}

function rtfToJson(doc) {
  const chapters = {};
  let sections;
  let entries;
  let entryCount;

  // console.error(doc.content);

  for (let i = 0; i < doc.content.length; i += 1) {
    // scan for chapter
    const chapterTitle = getHeading(doc.content[i]);
    if (!chapterTitle) {
      continue;
    }
    sections = {};
    entryCount = 0;

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
        const entry = {
          source: { id: sectionTitle.trim() },
          mid: urlify(chapterTitle),
          starred: false
        };
        entry.content = renderPara(doc.content[i]);
        try {
          if (entry.content) {
            entry.content = simplify(entry.content);
            const reStar = /^(<em>)*\s*\*{1,3}\s*(<\/em>)*/;
            if (entry.content.match(reStar)) {
              entry.starred = true;
              entry.content = entry.content.replace(reStar, '');
            }
            const re = new RegExp(
              `^(<em>)*\\s*${sourcePattern.source.substr(1)}*(</em>)*`
            );
            entry.content = entry.content.replace(re, '').trim();
            entries = entries.concat({
              ...entry,
              ...getLocations(entry)
            });
            try {
              correctLastEntry(entries);
            } catch (err) {
              throw new Error({
                msg: 'Missing or bad location',
                content: entries[entries.length - 1].content,
              });
            }
            parseLocations(entries[entries.length - 1]);
          }
        } catch (err) {
          console.error(JSON.stringify({
            msg: '☠️ Error processing entry',
            content: {
              entry,
              lastEntry: entries[entries.length - 1]
            },
            inner: err.stack.toString().split('\n')
          }, null, 2));
          // throw err;
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

      // add or append the entries to the section
      const sid = sectionTitle.replace(/^\*{1,3}/, '').trim();
      if (sections[sid]) {
        console.warn(`${chapterTitle} Duplicate source ${sid} (appending)`);
        sections[sid] = sections[sid].concat(entries);
      } else {
        sections[sid] = entries;
      }
      entryCount += entries.length;
    } while (i < doc.content.length);

    const chapterTitleText = textify(chapterTitle);
    const chapterTitleUrl = urlify(chapterTitleText);

    if (!chapterTitleUrl.length) {
      continue;
    }

    chapters[urlify(chapterTitleText)] = {
      title: chapterTitle,
      sources: sections,
      entryCount
    };
  }

  // console.log(chapters);
  return chapters;
}

function parseLocations(entry) {
  // remove all non-numeric or delim chars
  let pages = entry.locations.raw
    .replace(/(anne|leiris)/i, '')
    .replace(/[^0-9ivxlcdm,\-()]/ig, '');

  // (36) => 36
  // (45-7) => 45-7
  if (pages.match(/^\([^)]+\)$/)) {
    pages = pages.replace(/[()]/g, '');
  }

  // pp. 41-2(60-2) => pp. 41-2
  pages = pages.replace(/\([^)]*\)/g, '');

  let pageList = [];

  // 204,206
  if (pages.match(/,/)) {
    pageList = pages.split(/,/);
  } else {
    // 123-24
    // xx-xxiv
    // 55
    pageList = pageList.concat(pages);
  }

  pageList = pageList.reduce((list, p) => {
    if (p.match(/-/)) {
      const range = p.split(/-/);
      // xx-xxiv
      // xvi-221
      const prange = range.map(n => parseFloat(
        n.match(/[ivxlcdm]/i) ? `0.${roman.toArabic(n)}` : n, 10
      ));
      // [123, 24] => [123, 124]
      if (prange[1] < prange[0]) {
        prange[1] = parseFloat(range[0].charAt(0) + range[1], 10);
      }
      return list.concat(prange);
    }
    if (p.match(/[ivxlcdm]/i)) {
      p = `0.${roman.toArabic(p)}`;
    }
    const f = parseFloat(p, 10);
    if (isNaN(f)) {
      throw new Error(`parseLocations: "${p}" is not a number.`);
    }
    return list.concat(f);
  }, []);

  let min = pageList[0];
  let max = pageList[0];
  pageList.forEach((p) => {
    if (p < min) {
      min = p;
    }
    if (p > max) {
      max = p;
    }
  });

  entry.locations.list = pageList;
  entry.locations.high = max;
  entry.locations.low = min;
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
      lastEntry.content = lastEntry.content.substr(2);
    } else {
      // stray line break, add content to previous entry and delete last
      entries[lastIdx - 1].content += ` ${lastEntry.content}`;
      entries.splice(-1, 1);
    }
  }
}

function getLocations(entry) {
  const content = textify(entry.content);
  const locations = {};
  const pp = /^p ?p?\.? ?/;

  const removeLocations = re =>
    entry.content.replace(
      new RegExp(`(<em>)*\\s*${re.source}\\s*(</em>)*`), ''
    );

  // pp. 204, 206
  const re1 = new RegExp(`${pp.source}([^ ,]+, *)+.+? `);
  let matches = content.match(re1);
  if (matches) {
    // console.log('--RE1', matches[0]);
    [locations.raw] = matches;
    return { content: removeLocations(re1), locations };
  }

  // pp. anne|leiris 28
  const re1a = new RegExp(`${pp.source}(anne|leiris) .+? `);
  matches = content.match(re1a);
  if (matches) {
    // console.log('--RE1A', matches[0]);
    [locations.raw] = matches;
    return { content: removeLocations(re1a), locations };
  }

  // pp. 41-2 (60-2)
  // pp. 148-49 (212-14)
  // p. 323n (13n)
  // p. (36)
  const re1b = new RegExp(`${pp.source}[^ ]* \\([^ \\)]+\\) `);
  matches = content.match(re1b);
  if (matches) {
    // console.log('--RE1B', matches[0]);
    [locations.raw] = matches;
    return { content: removeLocations(re1b), locations };
  }

  // pp. 94-7
  const re2 = new RegExp(`${pp.source}[^ ,]+ `);
  matches = content.match(re2);
  if (matches) {
    // console.log('--RE2', matches[0]);
    [locations.raw] = matches;
    return { content: removeLocations(re2), locations };
  }

  return { content: entry.content, locations };
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
      allBold && c.style.font && c.style.font.name && c.style.font.name.match(/bold/i),
    true)
  );
}

if (require.main === module) {
  docToJson({ input: '../BBDD.rtf', output: { public: './public', content: './src/content' } });
}
