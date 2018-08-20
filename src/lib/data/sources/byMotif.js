import { aggregate } from '../mongo';
import { textify } from '../../_helpers';

const sortByCountAndTitle = list => list.sort((sourceA, sourceB) => {
  const titleA = textify(sourceA.title || '');
  const titleB = textify(sourceB.title || '');
  if (sourceA.entryCount === sourceB.entryCount) {
    return titleA > titleB ? 1 : -1;
  }
  return sourceB.entryCount - sourceA.entryCount;
});

export default async (query) => {
  const q = query || {};
  const groupQuery = {
    _id: '$source.id',
    entryCount: { $sum: 1 },
    title: { $first: '$source.title' }
  };
  const matchQuery = {
    'motif.id': q.motifId,
    ...(q.author ? { 'source.author': q.author } : {})
  };
  return sortByCountAndTitle(await aggregate('entries', groupQuery, matchQuery));
};
