export const SESSION_COOKIE_NAME = 'astro_blog_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_CONSTANTS = {
  TOKEN_BYTES: 32,
  MS_PER_SECOND: 1000,
  LOGIN_PATH: '/admin/login',
  ROOT_PATH: '/',
  JSON_CONTENT_TYPE: 'application/json',
  MISSING_CREDENTIALS_MESSAGE: 'Vui lòng nhập tài khoản và mật khẩu.',
  INVALID_CREDENTIALS_MESSAGE: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  LOGIN_SUCCESS_MESSAGE: 'Đăng nhập thành công!',
  AUTH_ERROR_MESSAGE: 'Đã có lỗi xảy ra trong quá trình xác thực.',
} as const;
