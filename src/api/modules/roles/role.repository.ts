import { db } from '../../db/index.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { Role } from './types.ts';

export class RoleRepository {
  async findAllWithPermissions(executor: DbExecutor = db): Promise<Role[]> {
    const roles = await executor.selectFrom('roles').selectAll().orderBy('name', 'asc').execute();
    if (roles.length === 0) return [];

    const permRows = await executor
      .selectFrom('role_permissions as rp')
      .innerJoin('permissions as p', 'p.id', 'rp.permission_id')
      .select(['rp.role_id', 'p.name'])
      .orderBy('p.name', 'asc')
      .execute();

    const permsByRoleId = new Map<number, string[]>();
    for (const row of permRows) {
      const list = permsByRoleId.get(row.role_id) ?? [];
      list.push(row.name);
      permsByRoleId.set(row.role_id, list);
    }

    return roles.map((role) => ({
      ...role,
      permissions: permsByRoleId.get(role.id) ?? [],
    }));
  }

  async findById(id: number, executor: DbExecutor = db): Promise<Role | undefined> {
    return executor.selectFrom('roles').selectAll().where('id', '=', id).executeTakeFirst();
  }

  async existsByIdAndName(id: number, name: string, executor: DbExecutor = db): Promise<boolean> {
    const row = await executor
      .selectFrom('roles')
      .select('id')
      .where('id', '=', id)
      .where('name', '=', name)
      .executeTakeFirst();
    return Boolean(row);
  }

  async findAllPermissions(executor: DbExecutor = db): Promise<string[]> {
    const rows = await executor
      .selectFrom('permissions')
      .select('name')
      .orderBy('name', 'asc')
      .execute();
    return rows.map((row) => row.name);
  }

  async create(name: string, label: string, executor: DbExecutor = db): Promise<number> {
    const result = await executor.insertInto('roles').values({ name, label }).executeTakeFirst();
    return Number(result.insertId);
  }

  async assignPermissions(
    roleId: number,
    permissions: string[],
    executor: DbExecutor = db
  ): Promise<void> {
    if (permissions.length === 0) return;

    const permissionRows = await executor
      .selectFrom('permissions')
      .select('id')
      .where('name', 'in', permissions)
      .execute();

    for (const perm of permissionRows) {
      await executor
        .insertInto('role_permissions')
        .values({ role_id: roleId, permission_id: perm.id })
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }

  async clearPermissions(roleId: number, executor: DbExecutor = db): Promise<void> {
    await executor.deleteFrom('role_permissions').where('role_id', '=', roleId).execute();
  }
}

export const roleRepository = new RoleRepository();
