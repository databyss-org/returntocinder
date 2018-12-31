import { list } from '../mongo';

export default async (sourceId) => {
  const sources = await list('sources', { id: sourceId });
  if (sources.length !== 1) {
    throw new Error(`Source not found with id: ${sourceId}`);
  }
  return sources[0];
};
