import { aggregate } from '../mongo';
import { textify } from '../../_helpers';

const sortByCountAndName = list => list.sort((sourceA, sourceB) => {
  const nameA = textify(sourceA.name || '');
  const nameB = textify(sourceB.name || '');
  if (sourceA.entryCount === sourceB.entryCount) {
    return nameA > nameB ? 1 : -1;
  }
  return sourceB.entryCount - sourceA.entryCount;
});

export default async (query) => {
  const q = query || {};
  const unwind = '$motif';
  const groupQuery = {
    _id: '$motif.id',
    entryCount: { $sum: 1 },
    name: { $first: '$motif.name' }
  };
  const matchQuery = { 'source.id': q.sourceId };
  return sortByCountAndName(
    await aggregate('entries', groupQuery, matchQuery, null, unwind)
  );
};
