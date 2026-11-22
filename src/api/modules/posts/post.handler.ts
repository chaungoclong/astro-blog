import type { Context } from 'hono';
import { slugify } from '../../../lib/utils.ts';
import { postService } from '../../index.ts';
import { API_MESSAGES, CONTENT_STATUS, HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { DEFAULT_AUTHOR_NAME, DEFAULT_CATEGORY_NAME, POSTS_CONSTANTS } from './constant.ts';

export async function createPostHandler(c: Context<ApiEnv>) {
  try {
    const data = await c.req.json();
    const title = data.title?.trim();
    if (!title) {
      return c.json(
        { success: false, message: POSTS_CONSTANTS.TITLE_REQUIRED_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    let slug = slugify(data.slug || title);
    if (!slug) slug = `${POSTS_CONSTANTS.FALLBACK_SLUG_PREFIX}${Date.now()}`;

    const existing = await postService.getPostBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-POSTS_CONSTANTS.SLUG_SUFFIX_LENGTH)}`;
    }

    const postId = await postService.createPost({
      title,
      slug,
      excerpt: data.excerpt?.trim() || '',
      content: data.content || '',
      cover_image: data.cover_image?.trim() || '',
      category: data.category?.trim() || DEFAULT_CATEGORY_NAME,
      tags: data.tags?.trim() || '',
      status:
        data.status === CONTENT_STATUS.PUBLISHED ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.DRAFT,
      author: data.author?.trim() || DEFAULT_AUTHOR_NAME,
    });

    return c.json({ success: true, id: postId, slug }, HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    const message =
      error instanceof Error ? error.message : POSTS_CONSTANTS.CREATE_POST_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function getPostByIdHandler(c: Context<ApiEnv>) {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ success: false, message: API_MESSAGES.INVALID_ID }, HTTP_STATUS.BAD_REQUEST);
  }

  const post = await postService.getPostById(id);
  if (!post) {
    return c.json(
      { success: false, message: POSTS_CONSTANTS.POST_NOT_FOUND_MESSAGE },
      HTTP_STATUS.NOT_FOUND
    );
  }

  return c.json({ success: true, post }, HTTP_STATUS.OK);
}

export async function updatePostHandler(c: Context<ApiEnv>) {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ success: false, message: API_MESSAGES.INVALID_ID }, HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const data = await c.req.json();
    const existing = await postService.getPostById(id);
    if (!existing) {
      return c.json(
        { success: false, message: POSTS_CONSTANTS.POST_MISSING_MESSAGE },
        HTTP_STATUS.NOT_FOUND
      );
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = slugify(data.slug);
      const postWithSlug = await postService.getPostBySlug(slug);
      if (postWithSlug && postWithSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-POSTS_CONSTANTS.SLUG_SUFFIX_LENGTH)}`;
      }
    }

    const updated = await postService.updatePost(id, {
      title: data.title !== undefined ? data.title.trim() : existing.title,
      slug,
      excerpt: data.excerpt !== undefined ? data.excerpt.trim() : existing.excerpt,
      content: data.content !== undefined ? data.content : existing.content,
      cover_image: data.cover_image !== undefined ? data.cover_image.trim() : existing.cover_image,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      tags: data.tags !== undefined ? data.tags.trim() : existing.tags,
      status:
        data.status !== undefined
          ? data.status === CONTENT_STATUS.PUBLISHED
            ? CONTENT_STATUS.PUBLISHED
            : CONTENT_STATUS.DRAFT
          : existing.status,
      author: data.author !== undefined ? data.author.trim() : existing.author,
    });

    return c.json({ success: updated, slug }, HTTP_STATUS.OK);
  } catch (error: unknown) {
    console.error('Error updating post:', error);
    const message =
      error instanceof Error ? error.message : POSTS_CONSTANTS.UPDATE_POST_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function deletePostHandler(c: Context<ApiEnv>) {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ success: false, message: API_MESSAGES.INVALID_ID }, HTTP_STATUS.BAD_REQUEST);
  }

  const deleted = await postService.deletePost(id);
  return c.json({ success: deleted }, deleted ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND);
}
