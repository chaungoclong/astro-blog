import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser, hasPermission, SESSION_COOKIE_NAME } from './api/modules/auth/index.ts';
import { PERMISSIONS } from './api/shared/constant.ts';
import type { PermissionName } from './api/shared/types.ts';
import { sessionService } from './api/index.ts';

const FORBIDDEN_STATUS = 403;
const FORBIDDEN_MESSAGE = 'Bạn không có quyền thực hiện thao tác này.';
const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN_PREFIX = '/admin/login';
const LOGOUT_PATH = '/api/auth/logout';
const FORBIDDEN_REDIRECT = '/admin?forbidden=1';

const PROTECTED_SECTIONS: readonly [string, PermissionName][] = [
  ['/admin/users', PERMISSIONS.USERS_MANAGE],
  ['/api/users', PERMISSIONS.USERS_MANAGE],
  ['/admin/roles', PERMISSIONS.ROLES_MANAGE],
  ['/api/roles', PERMISSIONS.ROLES_MANAGE],
  ['/admin/permissions', PERMISSIONS.ROLES_MANAGE],
  ['/admin/menus', PERMISSIONS.MENUS_MANAGE],
  ['/api/menus', PERMISSIONS.MENUS_MANAGE],
  ['/admin/posts', PERMISSIONS.POSTS_MANAGE],
  ['/api/posts', PERMISSIONS.POSTS_MANAGE],
  ['/admin/pages', PERMISSIONS.PAGES_MANAGE],
  ['/api/pages', PERMISSIONS.PAGES_MANAGE],
  ['/admin/categories', PERMISSIONS.CATEGORIES_MANAGE],
  ['/api/categories', PERMISSIONS.CATEGORIES_MANAGE],
  ['/admin/media', PERMISSIONS.MEDIA_MANAGE],
  ['/api/media', PERMISSIONS.MEDIA_MANAGE],
  ['/admin/settings', PERMISSIONS.SETTINGS_MANAGE],
  ['/api/settings', PERMISSIONS.SETTINGS_MANAGE],
];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  if (pathname.startsWith(ADMIN_PREFIX) && !pathname.startsWith(ADMIN_LOGIN_PREFIX)) {
    const sessionToken = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = sessionToken ? await sessionService.getSession(sessionToken) : null;

    if (!session) {
      return context.redirect(`${ADMIN_LOGIN_PREFIX}?redirect=${encodeURIComponent(pathname)}`);
    }
    if (!(await getCurrentUser(context.cookies))) {
      return context.redirect(LOGOUT_PATH);
    }
  }

  const protectedSection = PROTECTED_SECTIONS.find(([prefix]) => pathname.startsWith(prefix));
  if (protectedSection && !(await hasPermission(context.cookies, protectedSection[1]))) {
    if (pathname.startsWith(ADMIN_PREFIX)) return context.redirect(FORBIDDEN_REDIRECT);
    return new Response(JSON.stringify({ success: false, message: FORBIDDEN_MESSAGE }), {
      status: FORBIDDEN_STATUS,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return next();
});
