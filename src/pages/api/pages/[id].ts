import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { slugify } from '../../../lib/utils';

const reservedSlugs = new Set(['admin', 'api', 'blog', 'category', 'search', 'about', 'robots.txt', 'sitemap.xml']);

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: 401 });
  const id = Number(params.id); const page = dbService.getPageById(id);
  if (!page) return Response.json({ success: false, message: 'Không tìm thấy trang.' }, { status: 404 });
  try {
    const data = await request.json();
    const title = data.title?.trim();
    if (!title) return Response.json({ success: false, message: 'Tên trang không được để trống.' }, { status: 400 });
    let slug = slugify(data.slug || title);
    if (!slug || reservedSlugs.has(slug)) return Response.json({ success: false, message: 'Đường dẫn này không thể sử dụng.' }, { status: 400 });
    const duplicate = dbService.getPageBySlug(slug);
    if (duplicate && duplicate.id !== id) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const success = dbService.updatePage(id, { title, slug, excerpt: data.excerpt?.trim() || '', content: data.content || '', status: data.status === 'published' ? 'published' : 'draft', show_in_nav: data.show_in_nav ? 1 : 0 });
    return Response.json({ success, slug });
  } catch (error: any) {
    return Response.json({ success: false, message: error?.message || 'Không thể cập nhật trang.' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: 401 });
  const deleted = dbService.deletePage(Number(params.id));
  return Response.json({ success: deleted }, { status: deleted ? 200 : 404 });
};
