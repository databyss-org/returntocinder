import { update } from '../mongo';

export default (motifId, doc) => update('motifs', { id: motifId }, doc);
