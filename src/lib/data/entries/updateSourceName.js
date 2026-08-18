import { updateMany } from '../mongo';

export default (sourceId, sourceName) =>
  updateMany(
    'entries',
    { 'source.id': sourceId },
    { $set: { 'source.name': sourceName } },
  );
