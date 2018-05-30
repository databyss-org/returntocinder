import { createIndex } from '../mongo';

export default () => createIndex('entries', 'content', true);
