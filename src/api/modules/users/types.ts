import type { ColumnType, Generated } from 'kysely';

export interface UsersTable {
  id: Generated<number>;
  username: string;
  display_name: string;
  password_hash: string;
  active: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<string, string | undefined, string>;
  updated_at: ColumnType<string, string | undefined, string>;
}

export interface UserRolesTable {
  user_id: number;
  role_id: number;
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  active: number;
  created_at: string;
  roles?: string[];
}
