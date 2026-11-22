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

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
export const SUPER_ADMIN_ROLE = 'super-admin';
export const DEFAULT_ADMIN_USERNAME = 'admin';

