export function sourcesFromEntries(entries) {
  return Object.keys(entries).reduce((sources, eid) => {
    const entry = entries[eid];
    const { id, title } = entry.source;
    if (!sources[id]) {
      sources[id] = { id, title, entries: [] };
    }
    sources[id].entries.push(entry);
    return sources;
  }, {});
}

export function entriesFromMotifs(motifs) {
  const entries = {};
  Object.keys(motifs).forEach((mid) => {
    const motif = motifs[mid];
    Object.keys(motif.sources).forEach((sid) => {
      const source = motif.sources[sid];
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
            title: ''
          },
          id: eid
        };
      });
    });
  });
  return entries;
}
