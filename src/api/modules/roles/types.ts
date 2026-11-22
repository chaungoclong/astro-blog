import type { Generated } from 'kysely';

export interface RolesTable {
  id: Generated<number>;
  name: string;
  label: string;
}

export interface PermissionsTable {
  id: Generated<number>;
  name: string;
}

export interface RolePermissionsTable {
  role_id: number;
  permission_id: number;
}

export interface Role {
  id: number;
  name: string;
  label: string;
  permissions?: string[];
}
