import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { slugify } from '../../../lib/utils';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();

    const title = data.title?.trim();
    if (!title) {
      return new Response(JSON.stringify({ success: false, message: 'Tiêu đề bài viết không được để trống.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let slug = slugify(data.slug || title);
    if (!slug) slug = 'bai-viet-' + Date.now();

    // Check if slug already exists
    const existing = dbService.getPostBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const postId = dbService.createPost({
      title,
      slug,
      excerpt: data.excerpt?.trim() || '',
      content: data.content || '',
      cover_image: data.cover_image?.trim() || '',
      category: data.category?.trim() || 'Chung',
      tags: data.tags?.trim() || '',
      status: data.status === 'published' ? 'published' : 'draft',
      author: data.author?.trim() || 'Admin',
    });

    return new Response(JSON.stringify({ success: true, id: postId, slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ success: false, message: error?.message || 'Lỗi khi tạo bài viết.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
