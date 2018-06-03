import fs from 'fs';

const { SITE_URL } = process.env;

export default () => {
  const motifs = JSON.parse(fs.readFileSync('./src/content/motifs.json'));
  const about = JSON.parse(fs.readFileSync('./src/content/about/menu.json'));
  return [
    ...about.map(page => `${SITE_URL}/about/${page.path}`),
    ...Object.keys(motifs).map(mid => `${SITE_URL}/motif/${mid}`)
  ];
};
