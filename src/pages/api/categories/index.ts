import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { slugify } from '../../../lib/utils';

export const GET: APIRoute = async () => {
  const categories = dbService.getCategories();
  return new Response(JSON.stringify({ success: true, categories }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const name = data.name?.trim();
    if (!name) {
      return new Response(JSON.stringify({ success: false, message: 'Tên chuyên mục không được để trống.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let slug = slugify(data.slug || name);
    const description = data.description?.trim() || '';

    const parentId = data.parent_id ? Number(data.parent_id) : null;
    const id = dbService.createCategory(name, slug, description, parentId);
    return new Response(JSON.stringify({ success: true, id, name, slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({ success: false, message: error?.message || 'Lỗi khi tạo chuyên mục.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
