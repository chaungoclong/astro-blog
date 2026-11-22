import { Hono } from 'hono';
import { PERMISSIONS } from '../../shared/constant.ts';
import {
  requireAuth,
  requirePermission,
  type ApiEnv,
} from '../../shared/middleware/auth.middleware.ts';
import {
  createPostHandler,
  deletePostHandler,
  getPostByIdHandler,
  updatePostHandler,
} from './post.handler.ts';

export const postRoutes = new Hono<ApiEnv>();

postRoutes.post('/', requireAuth, requirePermission(PERMISSIONS.POSTS_MANAGE), createPostHandler);
postRoutes.get('/:id', getPostByIdHandler);
postRoutes.put('/:id', requireAuth, requirePermission(PERMISSIONS.POSTS_MANAGE), updatePostHandler);
postRoutes.delete(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.POSTS_MANAGE),
  deletePostHandler
);
