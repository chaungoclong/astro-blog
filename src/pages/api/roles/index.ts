import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
export const GET: APIRoute = async () => new Response(JSON.stringify({ success: true, roles: dbService.getRoles(), permissions: dbService.getPermissions() }), { headers: JSON_HEADERS });
export const POST: APIRoute = async ({ request }) => { try { const data = await request.json(); const name = String(data.name || '').trim(); const label = String(data.label || '').trim(); if (!name || !label) throw new Error('Tên kỹ thuật và nhãn vai trò là bắt buộc.'); const id = dbService.createRole(name, label, Array.isArray(data.permissions) ? data.permissions : []); return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: JSON_HEADERS }); } catch (error: any) { return new Response(JSON.stringify({ success: false, message: error.message }), { status: 400, headers: JSON_HEADERS }); } };
