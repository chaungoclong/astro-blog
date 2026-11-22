import { menuRepository } from './menu.repository.ts';
import type { MenuItem } from './types.ts';

const MISSING_PARENT_MENU_ID = 0;

async function isValidMenuParent(id: number, parentId: number | null): Promise<boolean> {
  if (parentId === id) return false;
  let ancestor = parentId;
  const visited = new Set<number>();

  while (ancestor !== null) {
    if (ancestor === id || visited.has(ancestor)) return false;
    visited.add(ancestor);
    const nextParentId = await menuRepository.findParentId(ancestor);
    if (nextParentId === undefined) return false;
    ancestor = nextParentId;
  }
  return true;
}

export class MenuService {
  async getMenuItems(visibleOnly: boolean = false): Promise<MenuItem[]> {
    return menuRepository.findAll(visibleOnly);
  }

  async createMenuItem(
    label: string,
    url: string,
    parentId: number | null = null
  ): Promise<number> {
    if (parentId !== null) {
      const parent = await menuRepository.findById(parentId);
      if (!parent) return MISSING_PARENT_MENU_ID;
    }

    const position = await menuRepository.nextPositionForParent(parentId);
    return menuRepository.create(label, url, parentId, position);
  }

  async updateMenuItem(
    id: number,
    data: {
      label?: string;
      url?: string;
      parent_id?: number | null;
      position?: number;
      visible?: boolean;
    }
  ): Promise<boolean> {
    if (data.parent_id !== undefined) {
      const validParent = await isValidMenuParent(id, data.parent_id);
      if (!validParent) return false;
    }

    const current = await menuRepository.findById(id);
    if (!current) return false;

    return menuRepository.update(id, {
      label: data.label ?? current.label,
      url: data.url ?? current.url,
      parent_id: data.parent_id === undefined ? current.parent_id : data.parent_id,
      position: data.position ?? current.position,
      visible: data.visible === undefined ? current.visible : Number(data.visible),
    });
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    return menuRepository.deleteBranch(id);
  }
}

export const menuService = new MenuService();
