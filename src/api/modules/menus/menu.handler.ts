import type { Context } from 'hono';
import { menuService } from '../../index.ts';
import { HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { MENUS_CONSTANTS } from './constant.ts';

export async function listMenusHandler(c: Context<ApiEnv>) {
  const items = await menuService.getMenuItems();
  return c.json({ success: true, items }, HTTP_STATUS.OK);
}

export async function createMenuHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const label = String(data.label || '').trim();
  const url = String(data.url || '').trim();
  if (
    !label ||
    !url ||
    (!url.startsWith(MENUS_CONSTANTS.ROOT_PREFIX) && !url.startsWith(MENUS_CONSTANTS.HTTPS_PREFIX))
  ) {
    return c.json(
      { success: false, message: MENUS_CONSTANTS.INVALID_MENU_INPUT_MESSAGE },
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const id = await menuService.createMenuItem(
    label,
    url,
    data.parent_id ? Number(data.parent_id) : null
  );
  if (!id) {
    return c.json(
      { success: false, message: MENUS_CONSTANTS.MISSING_PARENT_MESSAGE },
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return c.json({ success: true, id }, HTTP_STATUS.CREATED);
}

export async function updateMenuHandler(c: Context<ApiEnv>) {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();
  const updated =
    id > 0 &&
    (await menuService.updateMenuItem(id, {
      label: data.label,
      url: data.url,
      parent_id:
        data.parent_id === null
          ? null
          : data.parent_id === undefined
            ? undefined
            : Number(data.parent_id),
      position: data.position === undefined ? undefined : Number(data.position),
      visible: data.visible,
    }));

  return c.json(
    { success: updated, message: updated ? undefined : MENUS_CONSTANTS.UPDATE_CYCLE_MESSAGE },
    updated ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  );
}

export async function deleteMenuHandler(c: Context<ApiEnv>) {
  const deleted = await menuService.deleteMenuItem(Number(c.req.param('id')));
  return c.json({ success: deleted }, deleted ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND);
}
