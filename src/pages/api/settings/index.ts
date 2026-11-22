import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { isAuthenticated, hashPassword, verifyPassword } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const settings = dbService.getSettings();

    // 1. Password change requested
    if (data.new_password) {
      if (!data.current_password) {
        return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!verifyPassword(data.current_password, settings.admin_password_hash)) {
        return new Response(JSON.stringify({ success: false, message: 'Mật khẩu hiện tại không chính xác.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (data.new_password.length < 6) {
        return new Response(JSON.stringify({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      dbService.updateSetting('admin_password_hash', hashPassword(data.new_password));
    }

    // 2. Update general settings
    const updates: Record<string, string> = {};
    if (data.site_title !== undefined) updates.site_title = data.site_title.trim();
    if (data.site_subtitle !== undefined) updates.site_subtitle = data.site_subtitle.trim();
    if (data.site_description !== undefined) updates.site_description = data.site_description.trim();
    if (data.author_name !== undefined) updates.author_name = data.author_name.trim();
    if (data.posts_per_page !== undefined) updates.posts_per_page = data.posts_per_page.toString();
    for (const key of ['brand_color', 'brand_color_deep', 'surface_color']) {
      if (data[key] !== undefined) {
        const value = String(data[key]).trim();
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
          return new Response(JSON.stringify({ success: false, message: 'Màu sắc phải ở định dạng mã HEX, ví dụ #0f766e.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        updates[key] = value;
      }
    }

    dbService.updateSettings(updates);

    return new Response(JSON.stringify({ success: true, message: 'Cài đặt đã được lưu thành công!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return new Response(JSON.stringify({ success: false, message: error?.message || 'Lỗi khi lưu cài đặt.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
