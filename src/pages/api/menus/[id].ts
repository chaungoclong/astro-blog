import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const UNAUTHORIZED = 401;
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), { status: UNAUTHORIZED, headers: JSON_HEADERS });
  const id = Number(params.id); const data = await request.json();
  const updated = id > 0 && dbService.updateMenuItem(id, { label: data.label, url: data.url, parent_id: data.parent_id === null ? null : data.parent_id === undefined ? undefined : Number(data.parent_id), position: data.position === undefined ? undefined : Number(data.position), visible: data.visible });
  return new Response(JSON.stringify({ success: updated, message: updated ? undefined : 'Không thể cập nhật; cấu trúc menu có thể tạo vòng lặp.' }), { status: updated ? 200 : BAD_REQUEST, headers: JSON_HEADERS });
};
export const DELETE: APIRoute = async ({ params, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), { status: UNAUTHORIZED, headers: JSON_HEADERS });
  const deleted = dbService.deleteMenuItem(Number(params.id));
  return new Response(JSON.stringify({ success: deleted }), { status: deleted ? 200 : NOT_FOUND, headers: JSON_HEADERS });
};
