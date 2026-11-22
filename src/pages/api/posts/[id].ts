import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { slugify } from '../../../lib/utils';

export const GET: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!id) {
    return new Response(JSON.stringify({ success: false, message: 'ID không hợp lệ.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const post = dbService.getPostById(id);
  if (!post) {
    return new Response(JSON.stringify({ success: false, message: 'Không tìm thấy bài viết.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, post }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
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

  try {
    const data = await request.json();
    const existing = dbService.getPostById(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, message: 'Bài viết không tồn tại.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = slugify(data.slug);
      const postWithSlug = dbService.getPostBySlug(slug);
      if (postWithSlug && postWithSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = dbService.updatePost(id, {
      title: data.title !== undefined ? data.title.trim() : existing.title,
      slug,
      excerpt: data.excerpt !== undefined ? data.excerpt.trim() : existing.excerpt,
      content: data.content !== undefined ? data.content : existing.content,
      cover_image: data.cover_image !== undefined ? data.cover_image.trim() : existing.cover_image,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      tags: data.tags !== undefined ? data.tags.trim() : existing.tags,
      status: data.status !== undefined ? (data.status === 'published' ? 'published' : 'draft') : existing.status,
      author: data.author !== undefined ? data.author.trim() : existing.author,
    });

    return new Response(JSON.stringify({ success: updated, slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return new Response(JSON.stringify({ success: false, message: error?.message || 'Lỗi khi cập nhật bài viết.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
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

  const deleted = dbService.deletePost(id);
  return new Response(JSON.stringify({ success: deleted }), {
    status: deleted ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
};
