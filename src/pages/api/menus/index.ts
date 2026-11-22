import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const BAD_REQUEST = 400;
const CREATED = 201;
const UNAUTHORIZED = 401;

export const GET: APIRoute = async () => new Response(JSON.stringify({ success: true, items: dbService.getMenuItems() }), { headers: JSON_HEADERS });
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), { status: UNAUTHORIZED, headers: JSON_HEADERS });
  const data = await request.json();
  const label = String(data.label || '').trim();
  const url = String(data.url || '').trim();
  if (!label || !url || (!url.startsWith('/') && !url.startsWith('https://'))) return new Response(JSON.stringify({ success: false, message: 'Nhãn và URL hợp lệ là bắt buộc.' }), { status: BAD_REQUEST, headers: JSON_HEADERS });
  const id = dbService.createMenuItem(label, url, data.parent_id ? Number(data.parent_id) : null);
  if (!id) return new Response(JSON.stringify({ success: false, message: 'Mục cha không tồn tại.' }), { status: BAD_REQUEST, headers: JSON_HEADERS });
  return new Response(JSON.stringify({ success: true, id }), { status: CREATED, headers: JSON_HEADERS });
};
