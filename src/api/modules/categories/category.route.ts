import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from './category.handler.ts';

export const categoryRoutes = new Hono<ApiEnv>();

categoryRoutes.get('/', listCategoriesHandler);
categoryRoutes.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  createCategoryHandler
);
categoryRoutes.put(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  updateCategoryHandler
);
categoryRoutes.delete(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  deleteCategoryHandler
);
