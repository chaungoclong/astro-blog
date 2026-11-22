import type { Context } from 'hono';
import { hashPassword } from '../auth/auth.service.ts';
import { roleService, userService } from '../../index.ts';
import { HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { USERS_CONSTANTS } from './constant.ts';

export async function listUsersHandler(c: Context<ApiEnv>) {
  const [users, roles] = await Promise.all([userService.getUsers(), roleService.getRoles()]);
  return c.json({ success: true, users, roles }, HTTP_STATUS.OK);
}

export async function createUserHandler(c: Context<ApiEnv>) {
  try {
    const data = await c.req.json();
    const username = String(data.username || '').trim();
    const displayName = String(data.display_name || '').trim();
    const password = String(data.password || '');

    if (!username || !displayName || password.length < USERS_CONSTANTS.MIN_PASSWORD_LENGTH) {
      return c.json(
        {
          success: false,
          message: `Tên đăng nhập, tên hiển thị và mật khẩu tối thiểu ${USERS_CONSTANTS.MIN_PASSWORD_LENGTH} ký tự là bắt buộc.`,
        },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const id = await userService.createUser(
      username,
      displayName,
      hashPassword(password),
      Array.isArray(data.role_ids) ? data.role_ids.map(Number) : []
    );
    return c.json({ success: true, id }, HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : USERS_CONSTANTS.CREATE_USER_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.BAD_REQUEST);
  }
}

export async function updateUserRolesHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const updated = await userService.updateUserRoles(
    Number(c.req.param('id')),
    Array.isArray(data.role_ids) ? data.role_ids.map(Number) : []
  );
  return c.json({ success: updated }, updated ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND);
}

export async function deleteUserHandler(c: Context<ApiEnv>) {
  const deleted = await userService.deleteUser(Number(c.req.param('id')));
  return c.json(
    {
      success: deleted,
      message: deleted ? undefined : USERS_CONSTANTS.DELETE_LAST_SUPER_ADMIN_MESSAGE,
    },
    deleted ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  );
}
