import type { APIRoute } from 'astro';
import { dbService } from '../../../lib/db';
import { verifyPassword, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let username = '';
    let password = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username?.trim();
      password = body.password;
    } else {
      const formData = await request.formData();
      username = formData.get('username')?.toString().trim() || '';
      password = formData.get('password')?.toString() || '';
    }

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = dbService.getUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return new Response(JSON.stringify({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create session
    createSession(String(user.id), cookies);

    return new Response(JSON.stringify({ success: true, message: 'Đăng nhập thành công!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Đã có lỗi xảy ra trong quá trình xác thực.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
