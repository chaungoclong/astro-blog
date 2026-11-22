import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import {
  createMediaFolderHandler,
  deleteMediaFolderHandler,
  deleteMediaHandler,
  listMediaHandler,
  moveMediaHandler,
  uploadMediaHandler,
} from './media.handler.ts';

export const mediaRoutes = new Hono<ApiEnv>();

mediaRoutes.use('*', requireAuth, requirePermission(PERMISSIONS.MEDIA_MANAGE));

mediaRoutes.get('/', listMediaHandler);
mediaRoutes.post('/', uploadMediaHandler);
mediaRoutes.put('/move', moveMediaHandler);
mediaRoutes.post('/folders', createMediaFolderHandler);
mediaRoutes.delete('/folders', deleteMediaFolderHandler);
mediaRoutes.delete('/:filename', deleteMediaHandler);
