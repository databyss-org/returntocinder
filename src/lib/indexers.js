/* eslint-disable no-console */

import React from 'react';
import latinize from 'latinize';
import * as JsDiff from 'diff';
import pluralize from 'pluralize';
import { textify, urlify, stemify } from './_helpers';
import junkWords from './junk.js';

export function sourcesFromEntries(entries) {
  return Object.keys(entries).reduce((sources, eid) => {
    const entry = entries[eid];
    const { id, name } = entry.source;
    const sid = id;
    if (!sources[sid]) {
      sources[sid] = { id, name, entries: [], entriesByMotif: [] };
    }
    sources[sid].entries.push(entry);
    if (!sources[sid].entriesByMotif[entry.motif.id]) {
      sources[sid].entriesByMotif[entry.motif.id] = {
        id: entry.motif.id,
        name: entry.motif.name,
        sources: { [sid]: [] },
      };
    }
    sources[sid].entriesByMotif[entry.motif.id].sources[sid].push(
      entry.content
    );
    return sources;
  }, {});
}

export function sidFromSourceCode(dsid) {
  return dsid
    .replace('***', '')
    .replace(/\([A-Z]+\)/, '')
    .trim();
}

export function entriesFromMotifs(motifs, biblio) {
  const entries = {};
  Object.keys(motifs).forEach(mid => {
    const motif = motifs[mid];
    Object.keys(motif.sources).forEach(dsid => {
      const source = motif.sources[dsid];
      const sid = sidFromSourceCode(dsid);
      if (!biblio[sid]) {
        console.warn(`Source [${sid}] not found in bibliography`);
      }
      source.forEach((entry, idx) => {
        const eid = mid + dsid.replace(/[/(/) ]/g, '') + idx;
        entries[eid] = {
          ...entry,
          motif: {
            id: mid,
            name: motif.name,
          },
          source: {
            id: sid,
            name: biblio[sid] && biblio[sid].name,
            display: dsid,
          },
          id: eid,
        };
      });
    });
  });
  return entries;
}

export function entryListFromEntries(entries) {
  return Object.keys(entries).map(eid => ({
    id: entries[eid].id,
    content: latinize(textify(entries[eid].content))
      .replace(/[“”]/g, '"')
      .replace('’', "'"),
  }));
}

export function sourceListFromSources(sources) {
  return sources.reduce(
    (list, source) =>
      list.concat({
        id: source.id,
        type: 'source',
        name: `${source.id} ${textify(source.title)}`,
        authorCode: source.author,
        display: (
          <div>
            <h3>{source.id}</h3> <span>{textify(source.title)}</span>
          </div>
        ),
      }),
    []
  );
}

export function biblioFromSources(sources) {
  return sources.reduce((dict, source) => {
    dict[source.id] = source;
    return dict;
  }, {});
}

export function sanitizeMotifName(name) {
  return name.replace(/[“”]/g, '"').replace('’', "'");
}

export function motifNamesFromMotifs(motifs) {
  return Object.keys(motifs).map(mid => sanitizeMotifName(motifs[mid].name));
}

export function motifDictFromList(motifList) {
  return motifList.reduce((dict, motif) => {
    dict[motif.id] = motif;
    return dict;
  }, {});
}

export function authorDictFromList(authorList) {
  return authorList.reduce((dict, author) => {
    dict[author.id] = author;
    return dict;
  }, {});
}

export function motifDictFromMotifs(motifs) {
  return Object.keys(motifs).reduce(
    (dict, mid) => ({
      ...dict,
      [mid]: sanitizeMotifName(motifs[mid].name || motifs[mid].title),
    }),
    {}
  );
}

export function rangeOverlapExists(range1, range2) {
  return (
    (range1.low >= range2.low && range1.low <= range2.high) ||
    (range1.high >= range2.low && range1.high <= range2.high) ||
    (range2.low >= range1.low && range2.low <= range1.high) ||
    (range2.high >= range1.low && range2.high <= range1.high)
  );
}

export function mergeEntries({ entryList, minCount, mergedList = [], log }) {
  if (!entryList.length) {
    return mergedList;
  }
  const entries = entryList.slice(1);
  const firstEntry = {
    ...entryList[0],
    motif: { [entryList[0].motif.id]: entryList[0].motif },
  };
  const mergeResult = mergedList.concat(firstEntry);

  log(firstEntry.content);
  log(firstEntry.locations);
  log(' ');

  const filteredEntries = entries.filter(entry => {
    const score = compare(firstEntry.content, entry.content, minCount);
    if (score) {
      log(entry.content);
      // check for overlap of page ranges
      if (!rangeOverlapExists(firstEntry.locations, entry.locations)) {
        log('❌', entry.locations);
        return true;
      }

      firstEntry.motif[entry.motif.id] = entry.motif;

      // Take the longest content
      if (entry.content.length > firstEntry.content.length) {
        firstEntry.content = entry.content;
        log('⭐ content');
      }
      // take the longest page range
      if (
        entry.locations.low < firstEntry.locations.low ||
        entry.locations.high > firstEntry.locations.high
      ) {
        log('⭐ locations', entry.locations);
        firstEntry.locations = entry.locations;
      }
      log(' ');
      return false;
    }
    return true;
  });

  // flatten motif object to list
  firstEntry.motif = Object.keys(firstEntry.motif)
    .reduce((arr, mid) => arr.concat(firstEntry.motif[mid]), [])
    .sort(m => m.name);

  log(' ');
  log(' ');

  // tail-recurse on new list with merged entries removed
  return mergeEntries({
    entryList: filteredEntries,
    minCount,
    mergedList: mergeResult,
    log,
  });
}

export function compare(s1, s2, minCount) {
  return JsDiff.diffWords(s1, s2).reduce((score, r) => {
    if (r.added || r.removed || r.value.split(/\s/).length < minCount) {
      return score;
    }
    return score + 1;
  }, 0);
}

export function groupEntriesBySource(entryList) {
  return entryList.reduce((sources, entry) => {
    if (!sources[entry.source.id]) {
      sources[entry.source.id] = [];
    }
    sources[entry.source.id].push(entry);
    sources[entry.source.id].sort((a, b) => a.locations.low - b.locations.low);
    return sources;
  }, {});
}

export function motifListFromEntries(entries) {
  const motifs = entries.reduce((motifs, entry) => {
    entry.motif.forEach(m => {
      motifs[m.id] = m;
    });
    return motifs;
  }, {});
  return Object.keys(motifs).map(mid => motifs[mid]);
}

export function addMotifsToBiblio(biblio, entriesBySource) {
  const bib = { ...biblio };
  Object.keys(entriesBySource).forEach(sid => {
    bib[sid].motifs = motifListFromEntries(entriesBySource[sid]);
  });
  return bib;
}

const suffixPattern = /ing$|ness$|ed$|ion$|y$|ality$|'s$|ty$/;
const splitPattern = /[- /]/;
const cleanPattern = /[()0-9,[\]+]/;

// returns a stem dict with the following structure:
// input: [
//   "carl schmitt's sovereign exception",
//   "carl schmitt"
//   "carl schmitt's political (enemy, partisan)",
//   "exception",
//   "exceptionality",
//   "sovereignty",
//   "sovereignty (bataille's)",
//   "beast and sovereign"
// ]
// output: {
//   carl: {
//     carlschmittssovereignexception: "carl schmitt's sovereign exception",
//     carlschmittspoliticalenemypartisan: "carl schmitt's political (enemy, partisan)",
//     carlschmitt: "carl schmitt",
//   },
//   schmitt: {
//     carlschmittssovereignexception: "carl schmitt's sovereign exception",
//     carlschmittspoliticalenemypartisan: "carl schmitt's political (enemy, partisan)",
//     carlschmitt: "carl schmitt",
//   },
//   exception: {
//     carlschmittssovereignexception: "carl schmitt's sovereign exception",
//     exception: "exception",
//     exceptionality: "exceptionality",
//   },
//   sovereign: {
//     carlschmittssovereignexception: "carl schmitt's sovereign exception",
//     sovereignty: "sovereignty",
//     sovereigntybatailles: "sovereignty (bataille's)",
//     beastandsovereign: "beast and sovereign"
//   },
// }
export function makeStemDict(motifDict) {
  const addStemmed = (dict, word, motifName) => {
    if (!dict[word]) {
      dict[word] = {};
    }
    const mid = urlify(textify(motifName));
    dict[word][mid] = motifName;
  };
  const stemDict = Object.values(motifDict).reduce((stemmed, motifName) => {
    const words = motifName
      .split(splitPattern)
      .map(w => latinize(w.toLowerCase()))
      .filter(w => !junkWords.includes(w))
      .map(w => pluralize.singular(w))
      .map(w => w.replace(cleanPattern, '').replace(suffixPattern, ''))
      .filter(w => !junkWords.includes(w))
      .filter(w => w.length > 2);

    words.forEach(w => addStemmed(stemmed, w, motifName));
    return stemmed;
  }, {});
  return stemDict;
}

export function linkMotifsInAllEntries({ entries, motifDict }) {
  const stemDoc = makeStemDict(motifDict);
  return Object.keys(entries.sources).reduce(
    (lm, sid) => {
      lm.sources[sid] = entries.sources[sid].map(source => ({
        ...source,
        linkedContent: linkMotifsInEntry({ content: source.content, stemDoc })
          .entry,
      }));
      return lm;
    },
    { ...entries }
  );
}

// tokenize content and replace motif names with links
// returns object with linked entries and a list of motifs found:
// {
//   entry: (string)
//   motifs: [{ name: (string), id: (string) }, ...]
// }
export function linkMotifsInEntry({ content, stemDoc }) {
  const words = content.split(' ');
  let motifDict = {};
  const entry = words
    .map(word => {
      // stem-ify
      const stemifiedWord = stemify(word);
      const stemWord = pluralize
        .singular(stemifiedWord)
        .replace(suffixPattern, '');
      const entryMotifDict = stemDoc[stemWord];
      if (!entryMotifDict) {
        return word;
      }
      // merge motifs with cumulitive motif list for entry
      motifDict = { ...motifDict, ...entryMotifDict };
      // move punctuation out of link
      const pre = word.match(/^[.,![\]*():;“”?]/);
      const post = word.match(/[.,![\]*():;“”?]$/);
      if (post) {
        word = word.substr(0, word.length - 1);
      }
      if (pre) {
        word = word.substr(1);
      }
      // generate motif link urls
      const midList = Object.keys(entryMotifDict);
      let url = `/motif/${midList[0]}`;
      if (midList.length > 1) {
        url = `/disambiguate/motif?mids=${midList.join(',')}`;
      }
      const link = `<a href='${url}'>${word}</a>`;
      return (pre ? pre[0] : '') + link + (post ? post[0] : '');
    })
    .join(' ');

  return {
    entry,
    motifs: Object.keys(motifDict).reduce(
      (motifList, id) =>
        motifList.concat({
          name: motifDict[id],
          id,
        }),
      []
    ),
  };
}

// removes entries not by specified author and adds their authors to a
//   cfauthors field
// parameters
//  entries: list of entry objects
//  author: string (eg 'DD')
// returns: {
//  entries,
//  cfauthors
// }
export function filterEntriesByAuthor({ entryList, author }) {
  const cfauthorsDict = {};
  const filteredEntryList = entryList.filter(entry => {
    if (entry.source.author !== author) {
      // record author
      cfauthorsDict[entry.source.author] = true;
      return false;
    }
    return true;
  });
  return {
    filteredEntryList,
    cfauthors: Object.keys(cfauthorsDict),
  };
}
export function entriesByLocation(entries) {
  const locationsDict = entries.reduce((dict, entry) => {
    if (!dict[entry.locations.raw]) {
      dict[entry.locations.raw] = { locations: entry.locations, entries: [] };
    }
    dict[entry.locations.raw].entries.push(entry);
    return dict;
  }, {});
  return Object.values(locationsDict)
    .sort((a, b) => a.locations.low - b.locations.low)
    .map(location => ({
      raw: location.locations.raw,
      entries: location.entries.map(entry => {
        const { content, linkedContent, motif, starred } = entry;
        return { content, linkedContent, motifs: motif, starred };
      }),
    }));
}
