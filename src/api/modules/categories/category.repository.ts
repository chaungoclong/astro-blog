import { sql } from 'kysely';
import { db } from '../../db/index.ts';
import { CONTENT_STATUS } from '../../shared/constant.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { Category } from './types.ts';

export class CategoryRepository {
  async findAllWithPostCounts(executor: DbExecutor = db): Promise<Category[]> {
    const rows = await executor
      .selectFrom('categories as c')
      .leftJoin('posts as p', 'p.category', 'c.name')
      .select([
        'c.id',
        'c.name',
        'c.slug',
        'c.description',
        'c.parent_id',
        'c.position',
        sql<number>`SUM(CASE WHEN p.status = ${CONTENT_STATUS.PUBLISHED} THEN 1 ELSE 0 END)`.as(
          'post_count'
        ),
        sql<number>`COUNT(p.id)`.as('total_post_count'),
      ])
      .groupBy('c.id')
      .orderBy(sql`c.parent_id IS NOT NULL`)
      .orderBy('c.position', 'asc')
      .orderBy('c.name', 'asc')
      .execute();

    return rows.map((row) => ({
      ...row,
      post_count: Number(row.post_count || 0),
      total_post_count: Number(row.total_post_count || 0),
    }));
  }

  async findBySlug(slug: string, executor: DbExecutor = db): Promise<Category | undefined> {
    return executor
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();
  }

  async findById(id: number, executor: DbExecutor = db): Promise<Category | undefined> {
    return executor.selectFrom('categories').selectAll().where('id', '=', id).executeTakeFirst();
  }

  async findParentId(id: number, executor: DbExecutor = db): Promise<number | null | undefined> {
    const row = await executor
      .selectFrom('categories')
      .select('parent_id')
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? row.parent_id : undefined;
  }

  async nextPositionForParent(parentId: number | null, executor: DbExecutor = db): Promise<number> {
    const baseQuery = executor
      .selectFrom('categories')
      .select(sql<number>`COALESCE(MAX(position), -1) + 1`.as('next_position'));

    const row =
      parentId === null
        ? await baseQuery.where('parent_id', 'is', null).executeTakeFirst()
        : await baseQuery.where('parent_id', '=', parentId).executeTakeFirst();

    return Number(row?.next_position ?? 0);
  }

  async create(
    data: {
      name: string;
      slug: string;
      description: string;
      parentId: number | null;
      position: number;
    },
    executor: DbExecutor = db
  ): Promise<number> {
    const result = await executor
      .insertInto('categories')
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parentId,
        position: data.position,
      })
      .executeTakeFirst();

    return Number(result.insertId);
  }

  async update(
    id: number,
    data: { name: string; slug: string; description: string; parentId: number | null },
    executor: DbExecutor = db
  ): Promise<boolean> {
    const result = await executor
      .updateTable('categories')
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parentId,
      })
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  async updateHierarchy(
    id: number,
    parentId: number | null,
    position: number,
    executor: DbExecutor = db
  ): Promise<boolean> {
    const result = await executor
      .updateTable('categories')
      .set({ parent_id: parentId, position })
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  async clearChildrenParent(parentId: number, executor: DbExecutor = db): Promise<void> {
    await executor
      .updateTable('categories')
      .set({ parent_id: null })
      .where('parent_id', '=', parentId)
      .execute();
  }

  async countPostsByCategoryId(id: number, executor: DbExecutor = db): Promise<number> {
    const row = await executor
      .selectFrom('categories as c')
      .leftJoin('posts as p', 'p.category', 'c.name')
      .select(sql<number>`COUNT(p.id)`.as('count'))
      .where('c.id', '=', id)
      .executeTakeFirst();

    return Number(row?.count || 0);
  }

  async count(executor: DbExecutor = db): Promise<number> {
    const row = await executor
      .selectFrom('categories')
      .select(sql<number>`COUNT(*)`.as('count'))
      .executeTakeFirst();
    return Number(row?.count || 0);
  }

  async delete(id: number, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor.deleteFrom('categories').where('id', '=', id).executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }
}

export const categoryRepository = new CategoryRepository();
