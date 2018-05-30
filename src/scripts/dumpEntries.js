import { list } from '../lib/data/entries';

const query = process.argv[2]
  && process.argv[2].split(',').reduce((dict, p) => {
    const [k, v] = p.split('=');
    dict[k] = v;
    return dict;
  }, {});

console.log('query', JSON.stringify(query, null, 2));

list(query)
  .then((results) => {
    console.log(JSON.stringify(results, null, 2));
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit();
  });
