import crypto from 'node:crypto';
import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { verifyPassword } from './auth.service.ts';
import { AUTH_CONSTANTS, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from './constant.ts';
import { sessionService, userService } from '../../index.ts';
import { HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/types.ts';

export async function loginHandler(c: Context<ApiEnv>) {
  try {
    const contentType = c.req.header('content-type') || '';
    let username = '';
    let password = '';

    if (contentType.includes(AUTH_CONSTANTS.JSON_CONTENT_TYPE)) {
      const body = await c.req.json();
      username = String(body.username || '').trim();
      password = String(body.password || '');
    } else {
      const formData = await c.req.formData();
      username = formData.get('username')?.toString().trim() || '';
      password = formData.get('password')?.toString() || '';
    }

    if (!username || !password) {
      return c.json(
        { success: false, message: AUTH_CONSTANTS.MISSING_CREDENTIALS_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const user = await userService.getUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return c.json(
        { success: false, message: AUTH_CONSTANTS.INVALID_CREDENTIALS_MESSAGE },
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const token = crypto.randomBytes(AUTH_CONSTANTS.TOKEN_BYTES).toString('hex');
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    await sessionService.createSession(token, String(user.id), expiresAt);

    setCookie(c, SESSION_COOKIE_NAME, token, {
      path: AUTH_CONSTANTS.ROOT_PATH,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION_MS / AUTH_CONSTANTS.MS_PER_SECOND,
    });

    return c.json({ success: true, message: AUTH_CONSTANTS.LOGIN_SUCCESS_MESSAGE }, HTTP_STATUS.OK);
  } catch (error) {
    console.error('Login error:', error);
    return c.json(
      { success: false, message: AUTH_CONSTANTS.AUTH_ERROR_MESSAGE },
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function logoutPostHandler(c: Context<ApiEnv>) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    await sessionService.deleteSession(token);
  }
  deleteCookie(c, SESSION_COOKIE_NAME, { path: AUTH_CONSTANTS.ROOT_PATH });
  return c.json({ success: true }, HTTP_STATUS.OK);
}

export async function logoutGetHandler(c: Context<ApiEnv>) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    await sessionService.deleteSession(token);
  }
  deleteCookie(c, SESSION_COOKIE_NAME, { path: AUTH_CONSTANTS.ROOT_PATH });
  return c.redirect(AUTH_CONSTANTS.LOGIN_PATH);
}
