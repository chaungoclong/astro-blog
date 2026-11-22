import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { slugify } from '../../../lib/utils';

const reservedSlugs = new Set(['admin', 'api', 'blog', 'category', 'search', 'about', 'robots.txt', 'sitemap.xml']);

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: 401 });
  try {
    const data = await request.json();
    const title = data.title?.trim();
    if (!title) return Response.json({ success: false, message: 'Tên trang không được để trống.' }, { status: 400 });
    let slug = slugify(data.slug || title);
    if (!slug || reservedSlugs.has(slug)) return Response.json({ success: false, message: 'Đường dẫn này không thể sử dụng.' }, { status: 400 });
    if (dbService.getPageBySlug(slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const id = dbService.createPage({ title, slug, excerpt: data.excerpt?.trim(), content: data.content || '', status: data.status === 'published' ? 'published' : 'draft', show_in_nav: Boolean(data.show_in_nav) });
    return Response.json({ success: true, id, slug }, { status: 201 });
  } catch (error: any) {
    return Response.json({ success: false, message: error?.message || 'Không thể tạo trang.' }, { status: 500 });
  }
};
