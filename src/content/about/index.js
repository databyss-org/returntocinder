import frontis from './frontis.json';
import menu from './menu.json';
import grammar from './grammar.json';
import epigraphs from './epigraphs.json';
import manifest from './manifest.json';
import contact from './contact.json';

const bibliography = (appState) => {
  const authors = appState.authorDict;
  const content = {
    title: 'bibliography'
  };
  if (!appState.biblio) {
    return {
      ...content,
      body: ['loading...']
    };
  }
  const biblioList = Object.keys(appState.biblio).reduce((list, sid) =>
    list.concat(appState.biblio[sid]), []
  );
  biblioList.sort((a, b) => a.id < b.id ? -1 : 1);
  const byAuthor = biblioList
    .reduce((dict, b) => (
      { ...dict, [b.author]: (dict[b.author] || []).concat(b) }
    ), {});

  return {
    title: 'bibliography',
    body: Object.keys(byAuthor).reduce((lines, author) =>
      [
        ...lines,
        `<h2>${authors[author].lastName}, ${authors[author].firstName}</h2>`,
        ...byAuthor[author].map(b => `${b.id} ${b.citations.join('<br />')}`)
      ],
    [])
  };
};

export {
  frontis,
  menu,
  grammar,
  epigraphs,
  manifest,
  bibliography,
  contact
};
