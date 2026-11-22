import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';
import { sessionService, userService } from '../../index.ts';
import type { PermissionName } from '../../shared/types.ts';
import type { User } from '../users/types.ts';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from './constant.ts';

const SALT_BYTES = 16;
const TOKEN_BYTES = 32;
const SCRYPT_KEY_LEN = 64;
const MS_PER_SECOND = 1000;
const REDIRECT_STATUS = 302;

/**
 * Hash password with scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LEN).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LEN).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Create a new user session and set cookie
 */
export async function createSession(userId: string, cookies: AstroCookies): Promise<string> {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  await sessionService.createSession(token, userId, expiresAt);

  cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_MS / MS_PER_SECOND,
  });

  return token;
}

/**
 * Check if the current request has a valid session
 */
export async function isAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  const session = await sessionService.getSession(token);
  return !!session;
}

export async function getCurrentUser(cookies: AstroCookies): Promise<User | undefined> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return undefined;
  const session = await sessionService.getSession(token);
  if (!session) return undefined;
  return userService.getUserById(Number(session.user_id));
}

export async function hasPermission(
  cookies: AstroCookies,
  permission: PermissionName
): Promise<boolean> {
  const user = await getCurrentUser(cookies);
  return Boolean(user && (await userService.userHasPermission(user.id, permission)));
}

/**
 * Invalidate current session and clear cookie
 */
export async function clearSession(cookies: AstroCookies): Promise<void> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await sessionService.deleteSession(token);
  }
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Helper to require authentication in an Astro page
 * Returns a Response redirect if not authenticated, or null if authenticated
 */
export async function requireAuth(
  cookies: AstroCookies,
  currentUrl?: string
): Promise<Response | null> {
  if (!(await isAuthenticated(cookies))) {
    const redirectUrl = currentUrl
      ? `/admin/login?redirect=${encodeURIComponent(currentUrl)}`
      : '/admin/login';
    return new Response(null, {
      status: REDIRECT_STATUS,
      headers: {
        Location: redirectUrl,
      },
    });
  }
  return null;
}
