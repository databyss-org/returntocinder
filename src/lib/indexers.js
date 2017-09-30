/* eslint-disable no-console*/

import React from 'react';
import latinize from 'latinize';
import * as JsDiff from 'diff';
import { textify } from './_helpers';

export function sourcesFromEntries(entries) {
  return Object.keys(entries).reduce((sources, eid) => {
    const entry = entries[eid];
    const { id, title } = entry.source;
    const sid = id;
    if (!sources[sid]) {
      sources[sid] = { id, title, entries: [], entriesByMotif: [] };
    }
    sources[sid].entries.push(entry);
    if (!sources[sid].entriesByMotif[entry.motif.id]) {
      sources[sid].entriesByMotif[entry.motif.id] = {
        id: entry.motif.id,
        title: entry.motif.title,
        sources: { [sid]: [] }
      };
    }
    sources[sid].entriesByMotif[entry.motif.id].sources[sid].push(entry.content);
    return sources;
  }, {});
}

export function entriesFromMotifs(motifs, biblio) {
  const entries = {};
  Object.keys(motifs).forEach((mid) => {
    const motif = motifs[mid];
    Object.keys(motif.sources).forEach((dsid) => {
      const source = motif.sources[dsid];
      const sid = dsid
        .replace('***', '')
        .replace(/\([A-Z]+\)/, '')
        .trim();
      if (!biblio[sid]) {
        console.warn(`Source [${sid}] not found in bibliography`);
      }
      source.forEach((entry, idx) => {
        const eid = mid + dsid.replace(/[/(/) ]/g, '') + idx;
        entries[eid] = {
          ...entry,
          motif: {
            id: mid,
            title: motif.title
          },
          source: {
            id: sid,
            title: biblio[sid] && biblio[sid].title,
            display: dsid
          },
          id: eid
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
      .replace(/[“”]/g, '"').replace('’', "'")
  }));
}

export function sourceListFromBiblio(biblio) {
  return Object.keys(biblio).reduce((list, sid) => list.concat({
    id: sid,
    type: 'source',
    name: `${biblio[sid].id} ${textify(biblio[sid].title)}`,
    display: (
      <div><h3>{biblio[sid].id}</h3> <span>{textify(biblio[sid].title)}</span></div>
    )
  }), []);
}

export function motifListFromMotifs(motifs) {
  return Object.keys(motifs).reduce((list, mid) => list.concat({
    id: mid,
    type: 'motif',
    name: textify(motifs[mid].title).replace(/[“”]/g, '"').replace('’', "'")
  }), []);
}

export function mergeEntries(entryList, minCount, mergedList = []) {
  if (!entryList.length) {
    return mergedList;
  }
  const entries = entryList.slice(1);
  const firstEntry = {
    ...entryList[0],
    motif: { [entryList[0].motif.id]: entryList[0].motif }
  };
  const mergeResult = mergedList.concat(firstEntry);

  console.log(firstEntry.content);
  console.log(firstEntry.locations);
  console.log(' ');

  const filteredEntries = entries.filter((entry) => {
    const score = compare(firstEntry.content, entry.content, minCount);
    if (score) {
      console.log(entry.content);
      // check for overlap of page ranges
      if (!(
        (firstEntry.locations.low >= entry.locations.low
        && firstEntry.locations.low <= entry.locations.high) ||
        (firstEntry.locations.high >= entry.locations.low
        && firstEntry.locations.high <= entry.locations.high) ||
        (entry.locations.low >= firstEntry.locations.low
        && entry.locations.low <= firstEntry.locations.high) ||
        (entry.locations.high >= firstEntry.locations.low
        && entry.locations.high <= firstEntry.locations.high)
      )) {
        console.log('❌', entry.locations);
        return true;
      }

      firstEntry.motif[entry.motif.id] = entry.motif;

      // Take the longest content
      if (entry.content.length > firstEntry.content.length) {
        firstEntry.content = entry.content;
        console.log('⭐ content');
      }
      // take the longest page range
      if (entry.locations.low < firstEntry.locations.low
      || entry.locations.high > firstEntry.locations.high) {
        console.log('⭐ locations', entry.locations);
        firstEntry.locations = entry.locations;
      }
      console.log(' ');
      return false;
    }
    return true;
  });

  // flatten motif object to list
  firstEntry.motif = Object.keys(firstEntry.motif)
    .reduce((arr, mid) => arr.concat(firstEntry.motif[mid]), [])
    .sort(m => m.name);

  console.log(' ');
  console.log(' ');

  // tail-recurse on new list with merged entries removed
  return mergeEntries(filteredEntries, minCount, mergeResult);
}

export function compare(s1, s2, minCount) {
  return JsDiff.diffWords(s1, s2).reduce((score, r) => {
    if (r.added ||
      r.removed ||
      r.value.split(/\s/).length < minCount) {
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
