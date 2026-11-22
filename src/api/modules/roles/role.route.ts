import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import {
  createRoleHandler,
  listRolesHandler,
  updateRolePermissionsHandler,
} from './role.handler.ts';

export const roleRoutes = new Hono<ApiEnv>();

roleRoutes.use('*', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE));

roleRoutes.get('/', listRolesHandler);
roleRoutes.post('/', createRoleHandler);
roleRoutes.put('/:id', updateRolePermissionsHandler);
