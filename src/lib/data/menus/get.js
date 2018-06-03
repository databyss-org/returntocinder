import { list } from '../mongo';

export default async (path) => {
  const menus = await list('menus', { path });
  if (!menus.length) {
    throw new Error(`Menu not found with path: ${path}`);
  }
  return menus;
};
