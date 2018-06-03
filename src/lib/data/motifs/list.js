import { list } from '../mongo';

export default () => list('motifs', {}, 'id');
