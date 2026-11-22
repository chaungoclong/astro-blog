import { db } from '../../db/index.ts';
import { settingRepository } from './setting.repository.ts';
import type { Settings } from './types.ts';

export class SettingService {
  async getSettings(): Promise<Settings> {
    return settingRepository.findAll();
  }

  async updateSetting(key: string, value: string): Promise<void> {
    await settingRepository.upsert(key, value);
  }

  async updateSettings(data: Record<string, string>): Promise<void> {
    await db.transaction().execute(async (trx) => {
      await settingRepository.upsertMany(data, trx);
    });
  }
}

export const settingService = new SettingService();
