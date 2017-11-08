/* eslint-disable no-console, no-continue */
import fs from 'fs';
import { simplify } from '../lib/_helpers';

export default function simplifyEntries({ path }) {
  const entries = JSON.parse(fs.readFileSync(`${path}/entries.json`));
  const simplified = entries.map(entry => ({
    ...entry,
    content: simplify(entry.content)
  }));
  fs.writeFileSync(`${path}/entries.json`, JSON.stringify(simplified));
}

if (require.main === module) {
  simplifyEntries({ path: process.argv[2] });
}
