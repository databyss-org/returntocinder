import fs from 'fs';
import { add as addAuthor } from '../lib/data/authors';

const authors = JSON.parse(fs.readFileSync('./src/content/authors.json'));

async function addAuthors() {
  let count = 0;
  for (const author of authors) {
    await addAuthor(author);
    count += 1;
  }
  console.log(`Added ${count} authors.`);
}

addAuthors()
  .catch((err) => { console.log(err); process.exit(1); })
  .then(() => process.exit());
