import { sql } from 'kysely';
import { db } from '../../db/index.ts';
import { CONTENT_STATUS } from '../../shared/constant.ts';
import type { ContentStatus, ContentStatusFilter, DbExecutor } from '../../shared/types.ts';
import {
  DEFAULT_AUTHOR_NAME,
  DEFAULT_CATEGORY_NAME,
  DEFAULT_OFFSET,
  DEFAULT_POST_COVER_IMAGE,
  DEFAULT_POSTS_LIMIT,
  DEFAULT_SORT_BY,
} from './constant.ts';
import type { Post } from './types.ts';

type SortDirection = 'asc' | 'desc';
type PostSortColumn = 'created_at' | 'updated_at' | 'views' | 'title';

const POST_SORT_OPTIONS: Record<string, { column: PostSortColumn; direction: SortDirection }> = {
  'created_at DESC': { column: 'created_at', direction: 'desc' },
  'created_at ASC': { column: 'created_at', direction: 'asc' },
  'updated_at DESC': { column: 'updated_at', direction: 'desc' },
  'views DESC': { column: 'views', direction: 'desc' },
  'title ASC': { column: 'title', direction: 'asc' },
};

export interface PostQueryOptions {
  status?: ContentStatusFilter;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category?: string;
  tags?: string;
  status?: ContentStatus;
  author?: string;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  category?: string;
  tags?: string;
  status?: ContentStatus;
  author?: string;
}

export class PostRepository {
  async findMany(options: PostQueryOptions = {}, executor: DbExecutor = db): Promise<Post[]> {
    const {
      status = CONTENT_STATUS.PUBLISHED,
      category,
      search,
      limit = DEFAULT_POSTS_LIMIT,
      offset = DEFAULT_OFFSET,
      sortBy = DEFAULT_SORT_BY,
    } = options;

    let query = executor.selectFrom('posts').selectAll();

    if (status !== CONTENT_STATUS.ALL) {
      query = query.where('status', '=', status);
    }

    if (category) {
      query = query.where('category', '=', category);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.where((eb) =>
        eb.or([
          eb('title', 'like', term),
          eb('excerpt', 'like', term),
          eb('content', 'like', term),
          eb('tags', 'like', term),
        ])
      );
    }

    const sortSpec = POST_SORT_OPTIONS[sortBy] ?? POST_SORT_OPTIONS[DEFAULT_SORT_BY];
    return query.orderBy(sortSpec.column, sortSpec.direction).limit(limit).offset(offset).execute();
  }

  async count(
    options: Omit<PostQueryOptions, 'limit' | 'offset' | 'sortBy'> = {},
    executor: DbExecutor = db
  ): Promise<number> {
    const { status = CONTENT_STATUS.PUBLISHED, category, search } = options;

    let query = executor.selectFrom('posts').select(sql<number>`COUNT(*)`.as('count'));

    if (status !== CONTENT_STATUS.ALL) {
      query = query.where('status', '=', status);
    }

    if (category) {
      query = query.where('category', '=', category);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.where((eb) =>
        eb.or([
          eb('title', 'like', term),
          eb('excerpt', 'like', term),
          eb('content', 'like', term),
          eb('tags', 'like', term),
        ])
      );
    }

    const row = await query.executeTakeFirst();
    return Number(row?.count || 0);
  }

  async findBySlug(slug: string, executor: DbExecutor = db): Promise<Post | undefined> {
    return executor.selectFrom('posts').selectAll().where('slug', '=', slug).executeTakeFirst();
  }

  async findById(id: number, executor: DbExecutor = db): Promise<Post | undefined> {
    return executor.selectFrom('posts').selectAll().where('id', '=', id).executeTakeFirst();
  }

  async create(data: CreatePostInput, executor: DbExecutor = db): Promise<number> {
    const result = await executor
      .insertInto('posts')
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        cover_image: data.cover_image || DEFAULT_POST_COVER_IMAGE,
        category: data.category || DEFAULT_CATEGORY_NAME,
        tags: data.tags || '',
        status: data.status || CONTENT_STATUS.DRAFT,
        author: data.author || DEFAULT_AUTHOR_NAME,
        created_at: sql<string>`datetime('now')`,
        updated_at: sql<string>`datetime('now')`,
      })
      .executeTakeFirst();

    return Number(result.insertId);
  }

  async update(id: number, data: UpdatePostInput, executor: DbExecutor = db): Promise<boolean> {
    const patch: Record<string, unknown> = {};
    const updatableFields: (keyof UpdatePostInput)[] = [
      'title',
      'slug',
      'excerpt',
      'content',
      'cover_image',
      'category',
      'tags',
      'status',
      'author',
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        patch[field] = data[field];
      }
    }

    if (Object.keys(patch).length === 0) return false;

    const result = await executor
      .updateTable('posts')
      .set({
        ...patch,
        updated_at: sql<string>`datetime('now')`,
      })
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  async renameCategory(
    previousName: string,
    nextName: string,
    executor: DbExecutor = db
  ): Promise<void> {
    await executor
      .updateTable('posts')
      .set({ category: nextName })
      .where('category', '=', previousName)
      .execute();
  }

  async delete(id: number, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor.deleteFrom('posts').where('id', '=', id).executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }

  async incrementViews(slug: string, executor: DbExecutor = db): Promise<void> {
    await executor
      .updateTable('posts')
      .set({ views: sql`views + 1` })
      .where('slug', '=', slug)
      .execute();
  }

  async sumViews(executor: DbExecutor = db): Promise<number> {
    const row = await executor
      .selectFrom('posts')
      .select(sql<number>`COALESCE(SUM(views), 0)`.as('total'))
      .executeTakeFirst();
    return Number(row?.total || 0);
  }

  async findMediaReferences(
    url: string,
    executor: DbExecutor = db
  ): Promise<{ id: number; title: string }[]> {
    const term = `%${url}%`;
    return executor
      .selectFrom('posts')
      .select(['id', 'title'])
      .where((eb) => eb.or([eb('cover_image', '=', url), eb('content', 'like', term)]))
      .execute();
  }
}

export const postRepository = new PostRepository();
