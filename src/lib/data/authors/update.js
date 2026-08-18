import { update } from '../mongo';

export default (authorId, author) => update('authors', { id: authorId }, author);
