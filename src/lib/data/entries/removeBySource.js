import { remove } from '../mongo';

export default sourceId => remove('entries', { 'source.id': sourceId }, false);
