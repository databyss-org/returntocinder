import fs from 'fs';
import { list as listMotifs } from '../lib/data/motifs';
import { list as listSources } from '../lib/data/sources';
import { get as getMenu } from '../lib/data/menus';

const { SITE_URL } = process.env;

export default async () => {
  const motifs = await listMotifs();
  const about = await getMenu('/about');
  const sources = await listSources();
  return [
    ...about.map(p => `${SITE_URL}${p.pagePath}`),
    ...motifs.map(m => `${SITE_URL}/motif/${m.id}`),
    ...sources.map(s => `${SITE_URL}/source/${s.id}`),
  ];
};
