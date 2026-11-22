import { Hono } from 'hono';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { loginHandler, logoutGetHandler, logoutPostHandler } from './auth.handler.ts';

export const authRoutes = new Hono<ApiEnv>();

authRoutes.post('/login', loginHandler);
authRoutes.post('/logout', logoutPostHandler);
authRoutes.get('/logout', logoutGetHandler);
