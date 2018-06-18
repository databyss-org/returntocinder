import { createIndex } from '../mongo';

export default () => createIndex('motifs', 'id');
