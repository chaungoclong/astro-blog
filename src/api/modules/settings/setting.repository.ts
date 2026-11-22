import { db } from '../../db/index.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { Settings } from './types.ts';

export class SettingRepository {
  async findAll(executor: DbExecutor = db): Promise<Settings> {
    const rows = await executor.selectFrom('settings').select(['key', 'value']).execute();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings as Settings;
  }

  async upsert(key: string, value: string, executor: DbExecutor = db): Promise<void> {
    await executor
      .insertInto('settings')
      .values({ key, value })
      .onConflict((oc) => oc.column('key').doUpdateSet({ value }))
      .execute();
  }

  async upsertMany(data: Record<string, string>, executor: DbExecutor = db): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.upsert(key, value, executor);
    }
  }
}

export const settingRepository = new SettingRepository();
