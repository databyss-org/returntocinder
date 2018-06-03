import fs from 'fs';
import { add as addPage } from '../lib/data/pages';

async function addPath(base, path) {
  const page = JSON.parse(fs.readFileSync(`./src/content/${base}/${path}.json`));
  await addPage({
    path: `${base}/${path}`,
    ...page,
  });
  console.log(`Added page: ${base}/${path}`);
}

const paths = ['contact', 'epigraphs', 'frontis', 'grammar', 'manifest', 'home'];

async function addPaths() {
  for (const path of paths) {
    await addPath('about', path);
  }
}
addPaths()
  .catch((err) => { console.log(err); process.exit(1); })
  .then(() => process.exit());
