import { remove } from '../mongo';

export default sourceId => remove('sources', { id: sourceId });
