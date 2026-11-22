import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
export const PUT: APIRoute = async ({ params, request }) => { const data = await request.json(); const updated = dbService.updateRolePermissions(Number(params.id), Array.isArray(data.permissions) ? data.permissions : []); return new Response(JSON.stringify({ success: updated }), { status: updated ? 200 : 404, headers: JSON_HEADERS }); };
