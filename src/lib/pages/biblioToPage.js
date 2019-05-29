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

  return () => ({
    title: 'bibliography',
    body: Object.keys(byAuthor).reduce(
      (lines, author) => [
        ...lines,
        `<h2>${authors[author].lastName}, ${authors[author].firstName}</h2>`,
        ...byAuthor[author].map(
          b =>
            `<a href="/source/${b.id}" id="biblio-link">${
              b.id
            }</a> ${b.citations.join('<br />')}`
        ),
      ],
      []
    ),
  })
}

export default biblioToPage
