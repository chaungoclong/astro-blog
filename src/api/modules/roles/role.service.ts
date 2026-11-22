import { db } from '../../db/index.ts';
import { ALL_PERMISSIONS, SUPER_ADMIN_ROLE } from '../../shared/constant.ts';
import { roleRepository } from './role.repository.ts';
import type { Role } from './types.ts';

export class RoleService {
  async getRoles(): Promise<Role[]> {
    return roleRepository.findAllWithPermissions();
  }

  async getPermissions(): Promise<string[]> {
    return roleRepository.findAllPermissions();
  }

  async createRole(name: string, label: string, permissions: string[]): Promise<number> {
    return db.transaction().execute(async (trx) => {
      const roleId = await roleRepository.create(name, label, trx);
      await roleRepository.assignPermissions(roleId, permissions, trx);
      return roleId;
    });
  }

  async updateRolePermissions(id: number, permissions: string[]): Promise<boolean> {
    const role = await roleRepository.findById(id);
    if (!role) return false;

    if (
      role.name === SUPER_ADMIN_ROLE &&
      !ALL_PERMISSIONS.every((permission) => permissions.includes(permission))
    ) {
      return false;
    }

    return db.transaction().execute(async (trx) => {
      await roleRepository.clearPermissions(id, trx);
      await roleRepository.assignPermissions(id, permissions, trx);
      return true;
    });
  }
}

export const roleService = new RoleService();
