import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryService, menuService, userService } from '../src/api/index.ts';
import {
  DEFAULT_ADMIN_USERNAME,
  PERMISSIONS,
  SUPER_ADMIN_ROLE,
} from '../src/api/shared/constant.ts';

const TEST_CATEGORY_NAME = 'Category hierarchy test';
const TEST_CATEGORY_SLUG = 'category-hierarchy-test';
const TEST_MENU_LABEL = 'Menu hierarchy test';
const TEST_MENU_URL = '/menu-hierarchy-test';

test('RBAC: migrated administrator inherits every permission through super-admin', async () => {
  const admin = await userService.getUserByUsername(DEFAULT_ADMIN_USERNAME);
  assert.ok(admin);
  const roles = (await userService.getUsers()).find((user) => user.id === admin.id)?.roles ?? [];
  assert.ok(roles.includes(SUPER_ADMIN_ROLE));
  for (const permission of Object.values(PERMISSIONS)) {
    assert.equal(await userService.userHasPermission(admin.id, permission), true);
  }
});

test('Hierarchy: categories and menus reject self-parent cycles', async () => {
  const categoryId = await categoryService.createCategory(TEST_CATEGORY_NAME, TEST_CATEGORY_SLUG);
  const menuId = await menuService.createMenuItem(TEST_MENU_LABEL, TEST_MENU_URL);
  try {
    assert.equal(await categoryService.updateCategoryHierarchy(categoryId, categoryId, 0), false);
    assert.equal(await menuService.updateMenuItem(menuId, { parent_id: menuId }), false);
  } finally {
    await categoryService.deleteCategory(categoryId);
    await menuService.deleteMenuItem(menuId);
  }
});

test('Menu migration: current blog navigation is persisted for management', async () => {
  const menu = await menuService.getMenuItems();
  assert.ok(menu.some((item) => item.label === 'Trang chủ' && item.url === '/'));
  const categoryRoot = menu.find((item) => item.label === 'Chuyên mục');
  assert.ok(categoryRoot);
  assert.ok(
    menu.some((item) => item.parent_id === categoryRoot.id && item.url.startsWith('/category/'))
  );
});
