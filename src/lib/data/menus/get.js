import { list } from '../mongo';

export default async (path) => {
  const menus = await list('menus', { path }, { ordinal: 1 });
  if (!menus.length) {
    throw new Error(`Menu not found with path: ${path}`);
  }
  return menus;
};
