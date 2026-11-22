import { db } from '../../db/index.ts';
import { SUPER_ADMIN_ROLE } from '../../shared/constant.ts';
import { roleRepository } from '../roles/role.repository.ts';
import type { User } from './types.ts';
import { userRepository } from './user.repository.ts';

const MIN_SUPER_ADMIN_COUNT = 1;

export class UserService {
  async getUserByUsername(
    username: string
  ): Promise<(User & { password_hash: string }) | undefined> {
    return userRepository.findActiveByUsername(username);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return userRepository.findById(id);
  }

  async getUsers(): Promise<User[]> {
    return userRepository.findAllWithRoles();
  }

  async createUser(
    username: string,
    displayName: string,
    passwordHash: string,
    roleIds: number[]
  ): Promise<number> {
    return db.transaction().execute(async (trx) => {
      const userId = await userRepository.create(username, displayName, passwordHash, trx);
      await userRepository.assignRoles(userId, roleIds, trx);
      return userId;
    });
  }

  async updateUserRoles(id: number, roleIds: number[]): Promise<boolean> {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) return false;

    const currentIsSuperAdmin = await userRepository.hasRole(id, SUPER_ADMIN_ROLE);
    let keepsSuperAdmin = false;
    for (const roleId of roleIds) {
      if (await roleRepository.existsByIdAndName(roleId, SUPER_ADMIN_ROLE)) {
        keepsSuperAdmin = true;
        break;
      }
    }

    if (currentIsSuperAdmin && !keepsSuperAdmin) {
      const superAdminCount = await userRepository.countUsersWithRole(SUPER_ADMIN_ROLE);
      if (superAdminCount <= MIN_SUPER_ADMIN_COUNT) return false;
    }

    return db.transaction().execute(async (trx) => {
      await userRepository.clearRoles(id, trx);
      await userRepository.assignRoles(id, roleIds, trx);
      return true;
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    const isSuperAdmin = await userRepository.hasRole(id, SUPER_ADMIN_ROLE);
    if (isSuperAdmin) {
      const superAdminCount = await userRepository.countUsersWithRole(SUPER_ADMIN_ROLE);
      if (superAdminCount <= MIN_SUPER_ADMIN_COUNT) return false;
    }

    return userRepository.delete(id);
  }

  async userHasPermission(userId: number, permission: string): Promise<boolean> {
    return userRepository.hasPermission(userId, permission);
  }
}

export const userService = new UserService();
