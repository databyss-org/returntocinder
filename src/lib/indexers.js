import React from 'react';
import latinize from 'latinize';
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
      const sid = dsid.replace('***', '');
      if (!biblio[sid]) {
        console.warn(`Source [${sid}] not found in bibliography`);
      }
      source.forEach((entry, idx) => {
        const eid = mid + sid + idx;
        entries[eid] = {
          content: entry,
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
