import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
export const PUT: APIRoute = async ({ params, request }) => { const data = await request.json(); const updated = dbService.updateUserRoles(Number(params.id), Array.isArray(data.role_ids) ? data.role_ids.map(Number) : []); return new Response(JSON.stringify({ success: updated }), { status: updated ? 200 : 404, headers: JSON_HEADERS }); };
export const DELETE: APIRoute = async ({ params }) => { const deleted = dbService.deleteUser(Number(params.id)); return new Response(JSON.stringify({ success: deleted, message: deleted ? undefined : 'Không thể xóa quản trị viên toàn quyền cuối cùng.' }), { status: deleted ? 200 : 400, headers: JSON_HEADERS }); };
