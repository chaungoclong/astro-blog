import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const MIN_PASSWORD_LENGTH = 8;
export const GET: APIRoute = async () => new Response(JSON.stringify({ success: true, users: dbService.getUsers(), roles: dbService.getRoles() }), { headers: JSON_HEADERS });
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json(); const username = String(data.username || '').trim(); const displayName = String(data.display_name || '').trim(); const password = String(data.password || '');
    if (!username || !displayName || password.length < MIN_PASSWORD_LENGTH) return new Response(JSON.stringify({ success: false, message: `Tên đăng nhập, tên hiển thị và mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự là bắt buộc.` }), { status: 400, headers: JSON_HEADERS });
    const id = dbService.createUser(username, displayName, hashPassword(password), Array.isArray(data.role_ids) ? data.role_ids.map(Number) : []);
    return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: JSON_HEADERS });
  } catch (error: any) { return new Response(JSON.stringify({ success: false, message: error.message || 'Không thể tạo người dùng.' }), { status: 400, headers: JSON_HEADERS }); }
};
