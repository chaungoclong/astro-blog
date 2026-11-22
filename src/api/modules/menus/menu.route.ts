import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import {
  createMenuHandler,
  deleteMenuHandler,
  listMenusHandler,
  updateMenuHandler,
} from './menu.handler.ts';

export const menuRoutes = new Hono<ApiEnv>();

menuRoutes.get('/', listMenusHandler);
menuRoutes.post('/', requireAuth, requirePermission(PERMISSIONS.MENUS_MANAGE), createMenuHandler);
menuRoutes.put('/:id', requireAuth, requirePermission(PERMISSIONS.MENUS_MANAGE), updateMenuHandler);
menuRoutes.delete(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.MENUS_MANAGE),
  deleteMenuHandler
);
