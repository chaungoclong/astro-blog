import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { slugify } from '../../../lib/utils';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response(JSON.stringify({ success: false }), { status: 401 });
  const data = await request.json();
  const name = String(data.name || '').trim();
  const slug = slugify(String(data.slug || name));
  const updated = name && slug ? dbService.updateCategory(Number(params.id), { name, slug, description: String(data.description || '').trim(), parentId: data.parent_id ? Number(data.parent_id) : null }) : false;
  return new Response(JSON.stringify({ success: updated, message: updated ? undefined : 'Dữ liệu không hợp lệ hoặc chuyên mục cha tạo thành vòng lặp.' }), { status: updated ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = Number(params.id);
  if (!id) {
    return new Response(JSON.stringify({ success: false, message: 'ID không hợp lệ.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const postCount = dbService.categoryPostCount(id);
  if (postCount > 0) return new Response(JSON.stringify({ success: false, message: `Không thể xóa: chuyên mục đang được ${postCount} bài viết sử dụng.` }), { status: 409, headers: { 'Content-Type': 'application/json' } });
  const deleted = dbService.deleteCategory(id);
  return new Response(JSON.stringify({ success: deleted, message: deleted ? undefined : 'Không tìm thấy chuyên mục.' }), {
    status: deleted ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
};
