import { list } from '../mongo';

export default async (path) => {
  const pages = await list('pages', { path });
  if (pages.length !== 1) {
    throw new Error(`Page not found with path: ${path}`);
  }
  return pages[0];
};
