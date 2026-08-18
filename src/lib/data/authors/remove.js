import { remove } from '../mongo';

export default authorId => remove('authors', { id: authorId });
