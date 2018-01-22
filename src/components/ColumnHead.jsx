import React from 'react';
import pluralize from 'pluralize';

const ColumnHead = ({
  doc,
  biblio,
  results,
  resultsMeta,
  entriesBySource,
  query,
  styles
}) => {
  const stats = {
    motif: term => ({
      title: doc[term].title,
      entryCount: doc[term].entryCount,
      sourceCount: Object.keys(doc[term].sources).length
    }),
    source: term => ({
      title: biblio[term].title,
      entryCount: entriesBySource[term].length,
      motifCount: biblio[term].motifs.length
    }),
    search: term => ({
      title: `Results for: ${term}`,
      entryCount: resultsMeta.count,
      motifCount: resultsMeta.motifList.length,
      sourceCount: resultsMeta.sourceList.length
    })
  }[query.type](query.term);

  const display = {
    entries: (
      <span>
        {stats.entryCount} {pluralize('entry', stats.entryCount)}
      </span>
    ),
    motifs: (
      <span>
        {stats.motifCount} {pluralize('motif', stats.motifCount)}
      </span>
    ),
    sources: (
      <span>
        {stats.sourceCount} {pluralize('source', stats.sourceCount)}
      </span>
    )
  };

  return (
    <header>
      <div className={styles.title}>
        <span dangerouslySetInnerHTML={{ __html: stats.title }} />
      </div>
      <div className={styles.stats}>
        {display.entries}
        {!query.motif && display.motifs}
        {!query.source && display.sources}
      </div>
    </header>
  );
};

export default ColumnHead;
