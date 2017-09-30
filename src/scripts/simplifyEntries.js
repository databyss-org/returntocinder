/* eslint-disable no-console, no-continue */
import fs from 'fs';
import { simplify } from '../lib/_helpers';

const entries = JSON.parse(fs.readFileSync('./public/entries.json'));

const simplified = entries.map(entry => ({
  ...entry,
  content: simplify(entry.content)
}));

fs.writeFile('./public/entries.json', JSON.stringify(simplified));
