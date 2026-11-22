import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import { updateSettingsHandler } from './setting.handler.ts';

export const settingRoutes = new Hono<ApiEnv>();

settingRoutes.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  updateSettingsHandler
);
