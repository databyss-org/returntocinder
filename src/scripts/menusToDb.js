import fs from 'fs';
import { add as addMenu } from '../lib/data/menus';

async function addPath(path) {
  const menu = JSON.parse(fs.readFileSync(`./src/content/${path}.json`));
  await addMenu(menu);
  console.log(`Added menu: ${path}`);
}

const paths = ['menu'];

async function addPaths() {
  for (const path of paths) {
    await addPath(path);
  }
}
addPaths()
  .catch((err) => { console.log(err); process.exit(1); })
  .then(() => process.exit());
