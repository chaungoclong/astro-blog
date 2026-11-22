import { sql } from 'kysely';
import { db } from '../../db/index.ts';
import { CONTENT_STATUS } from '../../shared/constant.ts';
import type { ContentStatus, ContentStatusFilter, DbExecutor } from '../../shared/types.ts';
import type { Page } from './types.ts';

export interface CreatePageInput {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status?: ContentStatus;
  show_in_nav?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: ContentStatus;
  show_in_nav?: number;
}

export class PageRepository {
  async findMany(
    status: ContentStatusFilter = CONTENT_STATUS.PUBLISHED,
    executor: DbExecutor = db
  ): Promise<Page[]> {
    let query = executor.selectFrom('pages').selectAll();
    if (status !== CONTENT_STATUS.ALL) {
      query = query.where('status', '=', status);
    }
    return query.orderBy('updated_at', 'desc').execute();
  }

  async findById(id: number, executor: DbExecutor = db): Promise<Page | undefined> {
    return executor.selectFrom('pages').selectAll().where('id', '=', id).executeTakeFirst();
  }

  async findBySlug(slug: string, executor: DbExecutor = db): Promise<Page | undefined> {
    return executor.selectFrom('pages').selectAll().where('slug', '=', slug).executeTakeFirst();
  }

  async create(data: CreatePageInput, executor: DbExecutor = db): Promise<number> {
    const result = await executor
      .insertInto('pages')
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content || '',
        status: data.status || CONTENT_STATUS.DRAFT,
        show_in_nav: data.show_in_nav ? 1 : 0,
        created_at: sql<string>`datetime('now')`,
        updated_at: sql<string>`datetime('now')`,
      })
      .executeTakeFirst();

    return Number(result.insertId);
  }

  async update(id: number, data: UpdatePageInput, executor: DbExecutor = db): Promise<boolean> {
    const patch: Record<string, unknown> = {};
    const updatableFields: (keyof UpdatePageInput)[] = [
      'title',
      'slug',
      'excerpt',
      'content',
      'status',
      'show_in_nav',
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        patch[field] = data[field];
      }
    }

    if (Object.keys(patch).length === 0) return false;

    const result = await executor
      .updateTable('pages')
      .set({
        ...patch,
        updated_at: sql<string>`datetime('now')`,
      })
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  async delete(id: number, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor.deleteFrom('pages').where('id', '=', id).executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }

  async count(executor: DbExecutor = db): Promise<number> {
    const row = await executor
      .selectFrom('pages')
      .select(sql<number>`COUNT(*)`.as('count'))
      .executeTakeFirst();
    return Number(row?.count || 0);
  }

  async findMediaReferences(
    url: string,
    executor: DbExecutor = db
  ): Promise<{ id: number; title: string }[]> {
    const term = `%${url}%`;
    return executor
      .selectFrom('pages')
      .select(['id', 'title'])
      .where('content', 'like', term)
      .execute();
  }
}

export const pageRepository = new PageRepository();
