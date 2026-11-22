import { defineMiddleware } from 'astro:middleware';
import { dbService } from './lib/db';
import { getCurrentUser, hasPermission, SESSION_COOKIE_NAME } from './lib/auth';
import { PERMISSIONS, type PermissionName } from './lib/permissions.ts';

const PROTECTED_SECTIONS: readonly [string, PermissionName][] = [
  ['/admin/users', PERMISSIONS.USERS_MANAGE], ['/api/users', PERMISSIONS.USERS_MANAGE],
  ['/admin/roles', PERMISSIONS.ROLES_MANAGE], ['/api/roles', PERMISSIONS.ROLES_MANAGE],
  ['/admin/permissions', PERMISSIONS.ROLES_MANAGE],
  ['/admin/menus', PERMISSIONS.MENUS_MANAGE], ['/api/menus', PERMISSIONS.MENUS_MANAGE],
  ['/admin/posts', PERMISSIONS.POSTS_MANAGE], ['/api/posts', PERMISSIONS.POSTS_MANAGE],
  ['/admin/pages', PERMISSIONS.PAGES_MANAGE], ['/api/pages', PERMISSIONS.PAGES_MANAGE],
  ['/admin/categories', PERMISSIONS.CATEGORIES_MANAGE], ['/api/categories', PERMISSIONS.CATEGORIES_MANAGE],
  ['/admin/media', PERMISSIONS.MEDIA_MANAGE], ['/api/media', PERMISSIONS.MEDIA_MANAGE],
  ['/admin/settings', PERMISSIONS.SETTINGS_MANAGE], ['/api/settings', PERMISSIONS.SETTINGS_MANAGE],
];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionToken = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = sessionToken ? dbService.getSession(sessionToken) : null;

    if (!session) {
      return context.redirect(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
    if (!getCurrentUser(context.cookies)) {
      return context.redirect('/api/auth/logout');
    }
  }

  const protectedSection = PROTECTED_SECTIONS.find(([prefix]) => pathname.startsWith(prefix));
  if (protectedSection && !hasPermission(context.cookies, protectedSection[1])) {
    if (pathname.startsWith('/admin')) return context.redirect('/admin?forbidden=1');
    return new Response(JSON.stringify({ success: false, message: 'Bạn không có quyền thực hiện thao tác này.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  return next();
});
