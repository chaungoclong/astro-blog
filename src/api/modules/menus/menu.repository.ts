import { sql } from 'kysely';
import { db } from '../../db/index.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { MenuItem } from './types.ts';

export interface UpdateMenuItemInput {
  label?: string;
  url?: string;
  parent_id?: number | null;
  position?: number;
  visible?: number;
}

export class MenuRepository {
  async findAll(visibleOnly: boolean = false, executor: DbExecutor = db): Promise<MenuItem[]> {
    let query = executor.selectFrom('menu_items').selectAll();
    if (visibleOnly) {
      query = query.where('visible', '=', 1);
    }
    return query
      .orderBy(sql`parent_id IS NOT NULL`)
      .orderBy('position', 'asc')
      .orderBy('id', 'asc')
      .execute();
  }

  async findById(id: number, executor: DbExecutor = db): Promise<MenuItem | undefined> {
    return executor.selectFrom('menu_items').selectAll().where('id', '=', id).executeTakeFirst();
  }

  async findParentId(id: number, executor: DbExecutor = db): Promise<number | null | undefined> {
    const row = await executor
      .selectFrom('menu_items')
      .select('parent_id')
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? row.parent_id : undefined;
  }

  async nextPositionForParent(parentId: number | null, executor: DbExecutor = db): Promise<number> {
    const baseQuery = executor
      .selectFrom('menu_items')
      .select(sql<number>`COALESCE(MAX(position), -1) + 1`.as('next_position'));

    const row =
      parentId === null
        ? await baseQuery.where('parent_id', 'is', null).executeTakeFirst()
        : await baseQuery.where('parent_id', '=', parentId).executeTakeFirst();

    return Number(row?.next_position ?? 0);
  }

  async create(
    label: string,
    url: string,
    parentId: number | null,
    position: number,
    executor: DbExecutor = db
  ): Promise<number> {
    const result = await executor
      .insertInto('menu_items')
      .values({ label, url, parent_id: parentId, position })
      .executeTakeFirst();
    return Number(result.insertId);
  }

  async update(id: number, data: UpdateMenuItemInput, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor
      .updateTable('menu_items')
      .set(data)
      .where('id', '=', id)
      .executeTakeFirst();
    return Number(result.numUpdatedRows) > 0;
  }

  async updateByUrl(
    currentUrl: string,
    label: string,
    nextUrl: string,
    executor: DbExecutor = db
  ): Promise<void> {
    await executor
      .updateTable('menu_items')
      .set({ label, url: nextUrl })
      .where('url', '=', currentUrl)
      .execute();
  }

  async deleteBranch(id: number, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor
      .withRecursive('branch', (cte) =>
        cte
          .selectFrom('menu_items')
          .select('id')
          .where('id', '=', id)
          .union((eb) =>
            eb
              .selectFrom('menu_items as child')
              .innerJoin('branch as parent', 'child.parent_id', 'parent.id')
              .select('child.id')
          )
      )
      .deleteFrom('menu_items')
      .where('id', 'in', (eb) => eb.selectFrom('branch').select('id'))
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}

export const menuRepository = new MenuRepository();
