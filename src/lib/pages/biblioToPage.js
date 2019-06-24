const biblioToPage = ({ biblio, authors }) => {
  const content = {
    title: 'bibliography',
  }
  if (!biblio) {
    return {
      ...content,
      body: ['loading...'],
    }
  }
  const biblioList = Object.keys(biblio).reduce(
    (list, sid) => list.concat(biblio[sid]),
    []
  )

  biblioList.sort((a, b) => (a.id < b.id ? -1 : 1))
  const byAuthor = biblioList.reduce(
    (dict, b) => ({ ...dict, [b.author]: (dict[b.author] || []).concat(b) }),
    {}
  )

  const sortedAuthors = []
  Object.keys(byAuthor)
    .sort()
    .forEach(function(key) {
      sortedAuthors[key] = byAuthor[key]
    })

  return () => ({
    title: 'bibliography',
    body: Object.keys(sortedAuthors).reduce(
      (lines, author) => [
        ...lines,
        `<h2 id='${authors[author].id}'>${authors[author].lastName}${authors[
          author
        ].firstName && ', ' + authors[author].firstName}</h2>`,
        ...byAuthor[author].map(
          (b, i) =>
            `<a key = '${i}' href="/source/${b.id}">${
              b.id
            }</a> ${b.citations.join('<br />')}`
        ),
      ],
      []
    ),
  })
}

export default biblioToPage
