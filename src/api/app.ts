import { Hono } from 'hono';
import { API_MESSAGES, HTTP_STATUS } from './shared/constant.ts';
import { authRoutes } from './modules/auth/index.ts';
import { categoryRoutes } from './modules/categories/index.ts';
import { mediaRoutes } from './modules/media/index.ts';
import { menuRoutes } from './modules/menus/index.ts';
import { pageRoutes } from './modules/pages/index.ts';
import { postRoutes } from './modules/posts/index.ts';
import { roleRoutes } from './modules/roles/index.ts';
import { settingRoutes } from './modules/settings/index.ts';
import { userRoutes } from './modules/users/index.ts';
import type { ApiEnv } from './shared/types.ts';

const API_BASE_PATH = '/api';

const API_ROUTES = {
  AUTH: '/auth',
  POSTS: '/posts',
  CATEGORIES: '/categories',
  PAGES: '/pages',
  MEDIA: '/media',
  MENUS: '/menus',
  USERS: '/users',
  ROLES: '/roles',
  SETTINGS: '/settings',
} as const;

export const apiApp = new Hono<ApiEnv>().basePath(API_BASE_PATH);

apiApp.route(API_ROUTES.AUTH, authRoutes);
apiApp.route(API_ROUTES.POSTS, postRoutes);
apiApp.route(API_ROUTES.CATEGORIES, categoryRoutes);
apiApp.route(API_ROUTES.PAGES, pageRoutes);
apiApp.route(API_ROUTES.MEDIA, mediaRoutes);
apiApp.route(API_ROUTES.MENUS, menuRoutes);
apiApp.route(API_ROUTES.USERS, userRoutes);
apiApp.route(API_ROUTES.ROLES, roleRoutes);
apiApp.route(API_ROUTES.SETTINGS, settingRoutes);

apiApp.notFound((c) => {
  return c.json({ success: false, message: API_MESSAGES.NOT_FOUND }, HTTP_STATUS.NOT_FOUND);
});

apiApp.onError((error, c) => {
  console.error('Hono API error:', error);
  return c.json(
    { success: false, message: error.message || API_MESSAGES.INTERNAL_ERROR },
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
});

export default apiApp;
