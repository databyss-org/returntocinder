import fs from 'fs';
import { textify, urlify } from '../lib/_helpers';

export default () => {
  const config = JSON.parse(fs.readFileSync('./src/content/config.json'));
  const motifs = JSON.parse(fs.readFileSync('./src/content/motifs.json'));
  const about = JSON.parse(fs.readFileSync('./src/content/about/menu.json'));
  return [
    ...about.map(page => `${config.url}/about/${page.path}`),
    ...motifs.map(m => `${config.url}/motif/${urlify(textify(m))}`)
  ];
};
