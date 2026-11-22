import type { Context } from 'hono';
import { slugify } from '../../../lib/utils.ts';
import { pageService } from '../../index.ts';
import { CONTENT_STATUS, HTTP_STATUS, RESERVED_PAGE_SLUGS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { PAGES_CONSTANTS } from './constant.ts';

export async function createPageHandler(c: Context<ApiEnv>) {
  try {
    const data = await c.req.json();
    const title = data.title?.trim();
    if (!title) {
      return c.json(
        { success: false, message: PAGES_CONSTANTS.TITLE_REQUIRED_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    let slug = slugify(data.slug || title);
    if (!slug || RESERVED_PAGE_SLUGS.has(slug)) {
      return c.json(
        { success: false, message: PAGES_CONSTANTS.RESERVED_SLUG_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (await pageService.getPageBySlug(slug)) {
      slug = `${slug}-${Date.now().toString().slice(-PAGES_CONSTANTS.SLUG_SUFFIX_LENGTH)}`;
    }

    const id = await pageService.createPage({
      title,
      slug,
      excerpt: data.excerpt?.trim(),
      content: data.content || '',
      status:
        data.status === CONTENT_STATUS.PUBLISHED ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.DRAFT,
      show_in_nav: Boolean(data.show_in_nav),
    });

    return c.json({ success: true, id, slug }, HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : PAGES_CONSTANTS.CREATE_PAGE_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function updatePageHandler(c: Context<ApiEnv>) {
  const id = Number(c.req.param('id'));
  const page = await pageService.getPageById(id);
  if (!page) {
    return c.json(
      { success: false, message: PAGES_CONSTANTS.PAGE_NOT_FOUND_MESSAGE },
      HTTP_STATUS.NOT_FOUND
    );
  }

  try {
    const data = await c.req.json();
    const title = data.title?.trim();
    if (!title) {
      return c.json(
        { success: false, message: PAGES_CONSTANTS.TITLE_REQUIRED_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    let slug = slugify(data.slug || title);
    if (!slug || RESERVED_PAGE_SLUGS.has(slug)) {
      return c.json(
        { success: false, message: PAGES_CONSTANTS.RESERVED_SLUG_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const duplicate = await pageService.getPageBySlug(slug);
    if (duplicate && duplicate.id !== id) {
      slug = `${slug}-${Date.now().toString().slice(-PAGES_CONSTANTS.SLUG_SUFFIX_LENGTH)}`;
    }

    const success = await pageService.updatePage(id, {
      title,
      slug,
      excerpt: data.excerpt?.trim() || '',
      content: data.content || '',
      status:
        data.status === CONTENT_STATUS.PUBLISHED ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.DRAFT,
      show_in_nav: data.show_in_nav ? 1 : 0,
    });

    return c.json({ success, slug }, HTTP_STATUS.OK);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : PAGES_CONSTANTS.UPDATE_PAGE_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function deletePageHandler(c: Context<ApiEnv>) {
  const deleted = await pageService.deletePage(Number(c.req.param('id')));
  return c.json({ success: deleted }, deleted ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND);
}
