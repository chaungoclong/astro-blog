import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import {
  createUserHandler,
  deleteUserHandler,
  listUsersHandler,
  updateUserRolesHandler,
} from './user.handler.ts';

export const userRoutes = new Hono<ApiEnv>();

userRoutes.use('*', requireAuth, requirePermission(PERMISSIONS.USERS_MANAGE));

userRoutes.get('/', listUsersHandler);
userRoutes.post('/', createUserHandler);
userRoutes.put('/:id', updateUserRolesHandler);
userRoutes.delete('/:id', deleteUserHandler);
