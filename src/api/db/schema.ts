import type { SessionsTable } from '../modules/auth/types.ts';
import type { CategoriesTable } from '../modules/categories/types.ts';
import type { MediaFoldersTable, MediaTable } from '../modules/media/types.ts';
import type { MenuItemsTable } from '../modules/menus/types.ts';
import type { PagesTable } from '../modules/pages/types.ts';
import type { PostsTable } from '../modules/posts/types.ts';
import type { PermissionsTable, RolePermissionsTable, RolesTable } from '../modules/roles/types.ts';
import type { SettingsTable } from '../modules/settings/types.ts';
import type { UserRolesTable, UsersTable } from '../modules/users/types.ts';

export interface Database {
  posts: PostsTable;
  categories: CategoriesTable;
  pages: PagesTable;
  media: MediaTable;
  media_folders: MediaFoldersTable;
  settings: SettingsTable;
  sessions: SessionsTable;
  users: UsersTable;
  roles: RolesTable;
  permissions: PermissionsTable;
  user_roles: UserRolesTable;
  role_permissions: RolePermissionsTable;
  menu_items: MenuItemsTable;
}
