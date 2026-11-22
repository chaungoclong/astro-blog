import { sql } from 'kysely';
import { db } from '../../db/index.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { User } from './types.ts';

const ACTIVE_USER_FLAG = 1;

export class UserRepository {
  async findActiveByUsername(
    username: string,
    executor: DbExecutor = db
  ): Promise<(User & { password_hash: string }) | undefined> {
    return executor
      .selectFrom('users')
      .select(['id', 'username', 'display_name', 'active', 'created_at', 'password_hash'])
      .where('username', '=', username)
      .where('active', '=', ACTIVE_USER_FLAG)
      .executeTakeFirst();
  }

  async findById(id: number, executor: DbExecutor = db): Promise<User | undefined> {
    return executor
      .selectFrom('users')
      .select(['id', 'username', 'display_name', 'active', 'created_at'])
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findAllWithRoles(executor: DbExecutor = db): Promise<User[]> {
    const users = await executor
      .selectFrom('users')
      .select(['id', 'username', 'display_name', 'active', 'created_at'])
      .orderBy('username', 'asc')
      .execute();

    if (users.length === 0) return [];

    const roleRows = await executor
      .selectFrom('user_roles as ur')
      .innerJoin('roles as r', 'r.id', 'ur.role_id')
      .select(['ur.user_id', 'r.name'])
      .execute();

    const rolesByUserId = new Map<number, string[]>();
    for (const row of roleRows) {
      const list = rolesByUserId.get(row.user_id) ?? [];
      list.push(row.name);
      rolesByUserId.set(row.user_id, list);
    }

    return users.map((user) => ({
      ...user,
      roles: rolesByUserId.get(user.id) ?? [],
    }));
  }

  async create(
    username: string,
    displayName: string,
    passwordHash: string,
    executor: DbExecutor = db
  ): Promise<number> {
    const result = await executor
      .insertInto('users')
      .values({
        username,
        display_name: displayName,
        password_hash: passwordHash,
      })
      .executeTakeFirst();

    return Number(result.insertId);
  }

  async assignRoles(userId: number, roleIds: number[], executor: DbExecutor = db): Promise<void> {
    for (const roleId of roleIds) {
      await executor
        .insertInto('user_roles')
        .values({ user_id: userId, role_id: roleId })
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }

  async clearRoles(userId: number, executor: DbExecutor = db): Promise<void> {
    await executor.deleteFrom('user_roles').where('user_id', '=', userId).execute();
  }

  async hasRole(userId: number, roleName: string, executor: DbExecutor = db): Promise<boolean> {
    const row = await executor
      .selectFrom('user_roles as ur')
      .innerJoin('roles as r', 'r.id', 'ur.role_id')
      .select('ur.user_id')
      .where('ur.user_id', '=', userId)
      .where('r.name', '=', roleName)
      .executeTakeFirst();
    return Boolean(row);
  }

  async countUsersWithRole(roleName: string, executor: DbExecutor = db): Promise<number> {
    const row = await executor
      .selectFrom('user_roles as ur')
      .innerJoin('roles as r', 'r.id', 'ur.role_id')
      .select(sql<number>`COUNT(DISTINCT ur.user_id)`.as('count'))
      .where('r.name', '=', roleName)
      .executeTakeFirst();
    return Number(row?.count || 0);
  }

  async hasPermission(
    userId: number,
    permission: string,
    executor: DbExecutor = db
  ): Promise<boolean> {
    const row = await executor
      .selectFrom('user_roles as ur')
      .innerJoin('role_permissions as rp', 'rp.role_id', 'ur.role_id')
      .innerJoin('permissions as p', 'p.id', 'rp.permission_id')
      .select('ur.user_id')
      .where('ur.user_id', '=', userId)
      .where('p.name', '=', permission)
      .limit(1)
      .executeTakeFirst();

    return Boolean(row);
  }

  async delete(id: number, executor: DbExecutor = db): Promise<boolean> {
    const result = await executor.deleteFrom('users').where('id', '=', id).executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }
}

export const userRepository = new UserRepository();
