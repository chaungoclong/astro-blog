import type { Context } from 'hono';
import { hashPassword, verifyPassword } from '../auth/auth.service.ts';
import { settingService } from '../../index.ts';
import { HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { SETTINGS_CONSTANTS } from './constant.ts';

export async function updateSettingsHandler(c: Context<ApiEnv>) {
  try {
    const data = await c.req.json();
    const settings = await settingService.getSettings();

    if (data.new_password) {
      if (!data.current_password) {
        return c.json(
          { success: false, message: SETTINGS_CONSTANTS.CURRENT_PASSWORD_REQUIRED_MESSAGE },
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (!verifyPassword(data.current_password, settings.admin_password_hash)) {
        return c.json(
          { success: false, message: SETTINGS_CONSTANTS.INVALID_CURRENT_PASSWORD_MESSAGE },
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (data.new_password.length < SETTINGS_CONSTANTS.MIN_NEW_PASSWORD_LENGTH) {
        return c.json(
          { success: false, message: SETTINGS_CONSTANTS.SHORT_PASSWORD_MESSAGE },
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await settingService.updateSetting('admin_password_hash', hashPassword(data.new_password));
    }

    const updates: Record<string, string> = {};
    if (data.site_title !== undefined) updates.site_title = data.site_title.trim();
    if (data.site_subtitle !== undefined) updates.site_subtitle = data.site_subtitle.trim();
    if (data.site_description !== undefined)
      updates.site_description = data.site_description.trim();
    if (data.author_name !== undefined) updates.author_name = data.author_name.trim();
    if (data.posts_per_page !== undefined) updates.posts_per_page = data.posts_per_page.toString();

    for (const key of SETTINGS_CONSTANTS.THEME_COLOR_KEYS) {
      if (data[key] !== undefined) {
        const value = String(data[key]).trim();
        if (!SETTINGS_CONSTANTS.HEX_COLOR_PATTERN.test(value)) {
          return c.json(
            { success: false, message: SETTINGS_CONSTANTS.INVALID_HEX_COLOR_MESSAGE },
            HTTP_STATUS.BAD_REQUEST
          );
        }
        updates[key] = value;
      }
    }

    await settingService.updateSettings(updates);

    return c.json(
      { success: true, message: SETTINGS_CONSTANTS.SETTINGS_SAVED_MESSAGE },
      HTTP_STATUS.OK
    );
  } catch (error: unknown) {
    console.error('Settings update error:', error);
    const message =
      error instanceof Error ? error.message : SETTINGS_CONSTANTS.SETTINGS_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
