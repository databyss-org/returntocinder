import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';
import authorDict from '../content/authors.json';

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
      sourceCount: Object.keys(doc[term].sources).length,
      authors: doc[term].cfauthors &&
        doc[term].cfauthors.filter(author => author !== query.author)
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
    }),
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
    ),
    authors: stats.authors && stats.authors.length ? (
      <span>
        [cf.&nbsp;
        {stats.authors.map((author, idx) => (
          <span key={author}>
            {idx ? ', ' : null}
            <Link to={`/motif/${query.term}:${author}`}>
              {authorDict[author].lastName}
            </Link>
          </span>
        ))}]
      </span>
    ) : null
  };

  return (
    <header>
      <div className={styles.titleAndAuthor}>
        <div className={styles.title}>
          <span dangerouslySetInnerHTML={{ __html: stats.title }} />
        </div>
        {query.author && (
          <div className={styles.author}>
            [{authorDict[query.author].lastName}]
          </div>
        )}
      </div>
      <div className={styles.statsAndAuthors}>
        <div className={styles.stats}>
          {display.entries}
          {!query.motif && display.motifs}
          {!query.source && display.sources}
        </div>
        <div className={styles.authors}>
          {display.authors}
        </div>
      </div>
    </header>
  );
};

export default ColumnHead;
