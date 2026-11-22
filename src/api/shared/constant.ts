export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_MESSAGES = {
  UNAUTHORIZED: 'Yêu cầu đăng nhập quản trị.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  INVALID_ID: 'ID không hợp lệ.',
  NOT_FOUND: 'Không tìm thấy tài nguyên.',
  INTERNAL_ERROR: 'Đã xảy ra lỗi hệ thống.',
} as const;

export const RESERVED_PAGE_SLUGS = new Set([
  'admin',
  'api',
  'blog',
  'category',
  'search',
  'about',
  'robots.txt',
  'sitemap.xml',
]);

export const CONTENT_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ALL: 'all',
} as const;

export const PERMISSIONS = {
  POSTS_MANAGE: 'posts.manage',
  PAGES_MANAGE: 'pages.manage',
  CATEGORIES_MANAGE: 'categories.manage',
  MEDIA_MANAGE: 'media.manage',
  MENUS_MANAGE: 'menus.manage',
  SETTINGS_MANAGE: 'settings.manage',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
export const SUPER_ADMIN_ROLE = 'super-admin';
export const DEFAULT_ADMIN_USERNAME = 'admin';
