import { list } from '../mongo';

export default async (motifId) => {
  const motifs = await list('motifs', { id: motifId });
  if (motifs.length !== 1) {
    throw new Error(`Motif not found with id: ${motifId}`);
  }
  return motifs[0];
};
