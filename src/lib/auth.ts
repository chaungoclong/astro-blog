import crypto from 'node:crypto';
import { dbService } from './db.ts';
import type { AstroCookies } from 'astro';
import type { PermissionName } from './permissions.ts';

export const SESSION_COOKIE_NAME = 'astro_blog_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash password with scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Create a new user session and set cookie
 */
export function createSession(userId: string, cookies: AstroCookies): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  dbService.createSession(token, userId, expiresAt);

  cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return token;
}

/**
 * Check if the current request has a valid session
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  const session = dbService.getSession(token);
  return !!session;
}

export function getCurrentUser(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return undefined;
  const session = dbService.getSession(token);
  if (!session) return undefined;
  return dbService.getUserById(Number(session.user_id));
}

export function hasPermission(cookies: AstroCookies, permission: PermissionName): boolean {
  const user = getCurrentUser(cookies);
  return Boolean(user && dbService.userHasPermission(user.id, permission));
}

/**
 * Invalidate current session and clear cookie
 */
export function clearSession(cookies: AstroCookies): void {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    dbService.deleteSession(token);
  }
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Helper to require authentication in an Astro page
 * Returns a Response redirect if not authenticated, or null if authenticated
 */
export function requireAuth(cookies: AstroCookies, currentUrl?: string): Response | null {
  if (!isAuthenticated(cookies)) {
    const redirectUrl = currentUrl ? `/admin/login?redirect=${encodeURIComponent(currentUrl)}` : '/admin/login';
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  }
  return null;
}
