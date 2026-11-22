import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import { createPageHandler, deletePageHandler, updatePageHandler } from './page.handler.ts';

export const pageRoutes = new Hono<ApiEnv>();

pageRoutes.post('/', requireAuth, requirePermission(PERMISSIONS.PAGES_MANAGE), createPageHandler);
pageRoutes.put('/:id', requireAuth, requirePermission(PERMISSIONS.PAGES_MANAGE), updatePageHandler);
pageRoutes.delete(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.PAGES_MANAGE),
  deletePageHandler
);
