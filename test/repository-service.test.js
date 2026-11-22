import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/api/db/index.ts';
import { postRepository, categoryRepository } from '../src/api/index.ts';
import { roleService, userService } from '../src/api/index.ts';
import { hashPassword } from '../src/api/modules/auth/auth.service.ts';
import {
  DEFAULT_ADMIN_USERNAME,
  PERMISSIONS,
  SUPER_ADMIN_ROLE,
} from '../src/api/shared/constant.ts';

const ROLLBACK_ERROR_MESSAGE = 'Intentional rollback test';

test('Kysely transaction rolls back all repository writes on failure', async () => {
  const unique = Date.now();
  const slug = `tx-rollback-${unique}`;

  await assert.rejects(
    db.transaction().execute(async (trx) => {
      await categoryRepository.create(
        {
          name: `TX Category ${unique}`,
          slug,
          description: 'Rollback test',
          parentId: null,
          position: 0,
        },
        trx
      );
      throw new Error(ROLLBACK_ERROR_MESSAGE);
    }),
    (error) => error instanceof Error && error.message === ROLLBACK_ERROR_MESSAGE
  );

  const category = await categoryRepository.findBySlug(slug);
  assert.equal(category, undefined, 'Rolled back category must not be persisted');
});

test('PostRepository: whitelists sortBy safely without SQL injection', async () => {
  const posts = await postRepository.findMany({
    status: 'published',
    limit: 2,
    sortBy: 'created_at DESC; DROP TABLE posts; --',
  });
  assert.ok(Array.isArray(posts));
  assert.ok(posts.length >= 1);
});

test('RBAC services: protect super-admin permissions and user lifecycle', async () => {
  const admin = await userService.getUserByUsername(DEFAULT_ADMIN_USERNAME);
  assert.ok(admin);

  const roles = await roleService.getRoles();
  const superAdminRole = roles.find((role) => role.name === SUPER_ADMIN_ROLE);
  assert.ok(superAdminRole);

  const downgraded = await roleService.updateRolePermissions(superAdminRole.id, [
    PERMISSIONS.POSTS_MANAGE,
  ]);
  assert.equal(downgraded, false, 'Super-admin role must retain all permissions');

  const superAdmins = (await userService.getUsers()).filter((user) =>
    user.roles?.includes(SUPER_ADMIN_ROLE)
  );
  if (superAdmins.length === 1) {
    const deletedLast = await userService.deleteUser(superAdmins[0].id);
    assert.equal(deletedLast, false, 'Last super-admin user must not be deleted');
  }

  const tempUsername = `temp-user-${Date.now()}`;
  const tempUserId = await userService.createUser(
    tempUsername,
    'Temp User',
    hashPassword('TempPass123!'),
    [superAdminRole.id]
  );
  assert.ok(tempUserId > 0);

  try {
    const updatedRoles = await userService.updateUserRoles(tempUserId, []);
    assert.equal(updatedRoles, true);
  } finally {
    const deletedTemp = await userService.deleteUser(tempUserId);
    assert.equal(deletedTemp, true);
  }
});
