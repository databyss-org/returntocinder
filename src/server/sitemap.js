import fs from 'fs';

export default () => {
  const config = JSON.parse(fs.readFileSync('./src/content/config.json'));
  const motifs = JSON.parse(fs.readFileSync('./src/content/motifs.json'));
  const about = JSON.parse(fs.readFileSync('./src/content/about/menu.json'));
  return [
    ...about.map(page => `${config.url}/about/${page.path}`),
    ...Object.keys(motifs).map(mid => `${config.url}/motif/${mid}`)
  ];
};
