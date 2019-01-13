import { list } from '../mongo';

export default async (authorId) => {
  const authors = await list('authors', { id: authorId });
  if (authors.length !== 1) {
    throw new Error(`Author not found with id: ${authorId}`);
  }
  return authors[0];
};
