import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { SESSION_COOKIE_NAME } from '../../modules/auth/constant.ts';
import { sessionService } from '../../modules/auth/session.service.ts';
import { userService } from '../../modules/users/user.service.ts';
import { API_MESSAGES, HTTP_STATUS } from '../constant.ts';
import type { ApiEnv, PermissionName } from '../types.ts';

export type { ApiEnv };

export const requireAuth: MiddlewareHandler<ApiEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    return c.json({ success: false, message: API_MESSAGES.UNAUTHORIZED }, HTTP_STATUS.UNAUTHORIZED);
  }

  const session = await sessionService.getSession(token);
  if (!session) {
    return c.json({ success: false, message: API_MESSAGES.UNAUTHORIZED }, HTTP_STATUS.UNAUTHORIZED);
  }

  c.set('userId', Number(session.user_id));
  await next();
};

export function requirePermission(permission: PermissionName): MiddlewareHandler<ApiEnv> {
  return async (c, next) => {
    const userId = c.get('userId');
    const allowed = Boolean(userId && (await userService.userHasPermission(userId, permission)));
    if (!allowed) {
      return c.json({ success: false, message: API_MESSAGES.FORBIDDEN }, HTTP_STATUS.FORBIDDEN);
    }
    await next();
  };
}
