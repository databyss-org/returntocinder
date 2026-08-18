import { update } from '../mongo';

export default (sourceId, source) => update('sources', { id: sourceId }, source);
