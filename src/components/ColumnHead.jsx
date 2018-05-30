import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';
import authorDict from '../content/authors.json';
import { defaultAuthor } from '../content/config.json';

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
      name: doc[term].name,
      entryCount: doc[term].entryCount,
      sourceCount: Object.keys(doc[term].sources).length,
      authors: doc[term].cfauthors &&
        doc[term].cfauthors.filter(author => author !== query.author)
    }),
    source: term => ({
      name: biblio[term].title,
      entryCount: entriesBySource[term].length,
    }),
    search: term => ({
      name: `Results for: ${term}`,
      entryCount: resultsMeta.count,
      sourceCount: resultsMeta.sourceList.length
    }),
  }[query.type](query.term);

  // add default author if viewing supplement
  if (query.author && query.author !== defaultAuthor) {
    stats.authors = (stats.authors || []).concat(defaultAuthor);
  }

  const display = {
    entries: (
      <span>
        {stats.entryCount} {pluralize('entry', stats.entryCount)}
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
            <Link to={`/motif/${query.resource}${
                author === defaultAuthor
                  ? '' : `:${author}`}`}>
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
        <span className={styles.title}>
          <span dangerouslySetInnerHTML={{ __html: stats.name }} />
          {query.author && (
            <span className={styles.author}>
              [{authorDict[query.author].lastName}]
            </span>
          )}
        </span>
      </div>
      <div className={styles.statsAndAuthors}>
        <div className={styles.stats}>
          {display.entries}
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
