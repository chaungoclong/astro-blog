import assert from 'node:assert/strict';
import test from 'node:test';
import { dbService } from '../src/lib/db.ts';
import { DEFAULT_ADMIN_USERNAME, PERMISSIONS, SUPER_ADMIN_ROLE } from '../src/lib/permissions.ts';

const TEST_CATEGORY_NAME = 'Category hierarchy test';
const TEST_CATEGORY_SLUG = 'category-hierarchy-test';
const TEST_MENU_LABEL = 'Menu hierarchy test';
const TEST_MENU_URL = '/menu-hierarchy-test';

test('RBAC: migrated administrator inherits every permission through super-admin', () => {
  const admin = dbService.getUserByUsername(DEFAULT_ADMIN_USERNAME);
  assert.ok(admin);
  const roles = dbService.getUsers().find((user) => user.id === admin.id)?.roles ?? [];
  assert.ok(roles.includes(SUPER_ADMIN_ROLE));
  for (const permission of Object.values(PERMISSIONS)) assert.equal(dbService.userHasPermission(admin.id, permission), true);
});

test('Hierarchy: categories and menus reject self-parent cycles', () => {
  const categoryId = dbService.createCategory(TEST_CATEGORY_NAME, TEST_CATEGORY_SLUG);
  const menuId = dbService.createMenuItem(TEST_MENU_LABEL, TEST_MENU_URL);
  try {
    assert.equal(dbService.updateCategoryHierarchy(categoryId, categoryId, 0), false);
    assert.equal(dbService.updateMenuItem(menuId, { parent_id: menuId }), false);
  } finally {
    dbService.deleteCategory(categoryId);
    dbService.deleteMenuItem(menuId);
  }
});

test('Menu migration: current blog navigation is persisted for management', () => {
  const menu = dbService.getMenuItems();
  assert.ok(menu.some((item) => item.label === 'Trang chủ' && item.url === '/'));
  const categoryRoot = menu.find((item) => item.label === 'Chuyên mục');
  assert.ok(categoryRoot);
  assert.ok(menu.some((item) => item.parent_id === categoryRoot.id && item.url.startsWith('/category/')));
});
