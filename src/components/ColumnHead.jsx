import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';
import urlencode from 'urlencode';

const { DEFAULT_AUTHOR } = process.env;

const ColumnHead = ({
  doc,
  biblio,
  results,
  resultsMeta,
  entriesBySource,
  query,
  styles,
  authorDict,
}) => {
  const stats = {
    motif: term => ({
      name: doc[term].name,
      entryCount: doc[term].entryCount,
      sourceCount: Object.keys(doc[term].sources).length,
      authors:
        doc[term].cfauthors &&
        doc[term].cfauthors.filter(author => author !== query.author),
    }),
    source: term => ({
      name: biblio[term].title,
      entryCount: entriesBySource[term].length,
    }),
    search: (term, resource) => ({
      name: `Results for: ${urlencode.decode(resource)}`,
      entryCount: resultsMeta.count,
      sourceCount: resultsMeta.sourceList.length,
      authors: resultsMeta.cfauthors,
    }),
  }[query.type](query.term, query.resource);

  // add default author if viewing supplement motif
  if (query.motif && query.author && query.author !== DEFAULT_AUTHOR) {
    stats.authors = (stats.authors || []).concat(DEFAULT_AUTHOR);
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
    authors:
      stats.authors && stats.authors.length ? (
        <React.Fragment>
          [cf.&nbsp;
          {stats.authors.map((author, idx) => (
            <span key={author}>
              <Link
                to={`/${query.type}/${query.resource}${
                  author === DEFAULT_AUTHOR ? '' : `:${author}`
                }`}
              >
                {authorDict[author].lastName}
              </Link>
            </span>
          ))}
          ]
        </React.Fragment>
      ) : null,
  };

  return (
    <header>
      <div className={styles.titleAndAuthor}>
        <span className={styles.title}>
          <span dangerouslySetInnerHTML={{ __html: stats.name }} />
          {query.author !== DEFAULT_AUTHOR && (
            <span className={styles.author}>
              [
              {authorDict[query.author].firstName &&
                `${authorDict[query.author].firstName} `}
              {authorDict[query.author].lastName}]
            </span>
          )}
        </span>
      </div>
      <div className={styles.statsAndAuthors}>
        <div className={styles.stats}>
          {display.entries}
          {!query.source && display.sources}
        </div>
        <div className={styles.authors}>{display.authors}</div>
      </div>
    </header>
  );
};

export default ColumnHead;
