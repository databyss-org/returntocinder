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

  console.log(firstEntry.content)
  console.log(' ')
  console.log(' ')

  const filteredEntries = entries.filter((entry) => {
    const score = compare(firstEntry.content, entry.content, minCount)
    if (score) {
      console.log(entry.content)
      console.log(score)
      console.log(' ')
      firstEntry.motif[entry.motif.id] = entry.motif;

      // Take the longest content
      if (entry.content.length > firstEntry.content.length) {
        firstEntry.content = entry.content;
      }
      // TODO: take the longest page range
      return false;
    }
    return true;
  });
  console.log(' ')
  console.log(' ')

  return mergeEntries(filteredEntries, minCount, mergeResult);
}

export function compare(s1, s2, minCount) {
  return JsDiff.diffWords(s1, s2).reduce((score, r) => {
    if (r.added ||
      r.removed ||
      r.value.split(/\s/).length < minCount) {
      return score;
    }
    console.log(r)
    return score + 1;
  }, 0);
}
