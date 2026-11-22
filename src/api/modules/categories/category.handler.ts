import type { Context } from 'hono';
import { slugify } from '../../../lib/utils.ts';
import { categoryService } from '../../index.ts';
import { API_MESSAGES, HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { CATEGORIES_CONSTANTS } from './constant.ts';

export async function listCategoriesHandler(c: Context<ApiEnv>) {
  const categories = await categoryService.getCategories();
  return c.json({ success: true, categories }, HTTP_STATUS.OK);
}

export async function createCategoryHandler(c: Context<ApiEnv>) {
  try {
    const data = await c.req.json();
    const name = data.name?.trim();
    if (!name) {
      return c.json(
        { success: false, message: CATEGORIES_CONSTANTS.NAME_REQUIRED_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const slug = slugify(data.slug || name);
    const description = data.description?.trim() || '';
    const parentId = data.parent_id ? Number(data.parent_id) : null;

    const id = await categoryService.createCategory(name, slug, description, parentId);
    return c.json({ success: true, id, name, slug }, HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const message =
      error instanceof Error ? error.message : CATEGORIES_CONSTANTS.CREATE_CATEGORY_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function updateCategoryHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const name = String(data.name || '').trim();
  const slug = slugify(String(data.slug || name));
  const updated =
    name && slug
      ? await categoryService.updateCategory(Number(c.req.param('id')), {
          name,
          slug,
          description: String(data.description || '').trim(),
          parentId: data.parent_id ? Number(data.parent_id) : null,
        })
      : false;

  return c.json(
    {
      success: updated,
      message: updated ? undefined : CATEGORIES_CONSTANTS.INVALID_HIERARCHY_MESSAGE,
    },
    updated ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  );
}

export async function deleteCategoryHandler(c: Context<ApiEnv>) {
  const id = Number(c.req.param('id'));
  if (!id) {
    return c.json({ success: false, message: API_MESSAGES.INVALID_ID }, HTTP_STATUS.BAD_REQUEST);
  }

  const postCount = await categoryService.categoryPostCount(id);
  if (postCount > 0) {
    return c.json(
      {
        success: false,
        message: `Không thể xóa: chuyên mục đang được ${postCount} bài viết sử dụng.`,
      },
      HTTP_STATUS.CONFLICT
    );
  }

  const deleted = await categoryService.deleteCategory(id);
  return c.json(
    {
      success: deleted,
      message: deleted ? undefined : CATEGORIES_CONSTANTS.CATEGORY_NOT_FOUND_MESSAGE,
    },
    deleted ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND
  );
}
