import type { Context } from 'hono';
import { roleService } from '../../index.ts';
import { HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { ROLES_CONSTANTS } from './constant.ts';

export async function listRolesHandler(c: Context<ApiEnv>) {
  const [roles, permissions] = await Promise.all([
    roleService.getRoles(),
    roleService.getPermissions(),
  ]);
  return c.json({ success: true, roles, permissions }, HTTP_STATUS.OK);
}

export async function createRoleHandler(c: Context<ApiEnv>) {
  try {
    const data = await c.req.json();
    const name = String(data.name || '').trim();
    const label = String(data.label || '').trim();
    if (!name || !label) {
      throw new Error(ROLES_CONSTANTS.ROLE_FIELDS_REQUIRED_MESSAGE);
    }

    const id = await roleService.createRole(
      name,
      label,
      Array.isArray(data.permissions) ? data.permissions : []
    );
    return c.json({ success: true, id }, HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : ROLES_CONSTANTS.ROLE_FIELDS_REQUIRED_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.BAD_REQUEST);
  }
}

export async function updateRolePermissionsHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const updated = await roleService.updateRolePermissions(
    Number(c.req.param('id')),
    Array.isArray(data.permissions) ? data.permissions : []
  );
  return c.json({ success: updated }, updated ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND);
}
