import { sql } from 'kysely';
import { db } from '../../db/index.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { MediaMetadata } from './types.ts';

export class MediaRepository {
  async findAllMetadata(executor: DbExecutor = db): Promise<MediaMetadata[]> {
    return executor.selectFrom('media').selectAll().orderBy('created_at', 'desc').execute();
  }

  async findAllFolders(executor: DbExecutor = db): Promise<string[]> {
    const rows = await executor
      .selectFrom('media_folders')
      .select('name')
      .orderBy('name', 'asc')
      .execute();
    return rows.map((row) => row.name);
  }

  async createFolder(name: string, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor
      .insertInto('media_folders')
      .values({ name })
      .onConflict((oc) => oc.doNothing())
      .executeTakeFirst();

    return Number(result.numInsertedOrUpdatedRows ?? 0) > 0;
  }

  async deleteFolder(name: string, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor
      .deleteFrom('media_folders')
      .where('name', '=', name)
      .executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }

  async upsertMetadata(
    filename: string,
    folder: string = '',
    originalName: string = filename,
    executor: DbExecutor = db
  ): Promise<void> {
    await executor
      .insertInto('media')
      .values({
        filename,
        folder,
        original_name: originalName,
        created_at: sql<string>`datetime('now')`,
      })
      .onConflict((oc) =>
        oc.column('filename').doUpdateSet({
          folder,
          original_name: originalName,
        })
      )
      .execute();
  }

  async moveMetadata(
    filename: string,
    folder: string,
    executor: DbExecutor = db
  ): Promise<boolean> {
    const result = await executor
      .updateTable('media')
      .set({ folder })
      .where('filename', '=', filename)
      .executeTakeFirst();
    return Number(result.numUpdatedRows) > 0;
  }

  async deleteMetadata(filename: string, executor: DbExecutor = db): Promise<void> {
    await executor.deleteFrom('media').where('filename', '=', filename).execute();
  }
}

export const mediaRepository = new MediaRepository();
