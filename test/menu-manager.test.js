import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { menuService } from '../src/api/index.ts';

const MENU_PAGE_PATH = new URL('../src/pages/admin/menus/index.astro', import.meta.url);
const HOME_SOURCE = "{ label: 'Trang chủ', url: '/' }";
const ABOUT_SOURCE = "{ label: 'Giới thiệu', url: '/about' }";

test('Menu manager: system sources remain recoverable and descendant parents are excluded', async () => {
  const source = await readFile(MENU_PAGE_PATH, 'utf8');
  assert.ok(source.includes(HOME_SOURCE));
  assert.ok(source.includes(ABOUT_SOURCE));
  assert.ok(source.includes('descendantIds(item.id)'));
  assert.ok(source.includes('!excluded.has(candidate.id)'));
});

test('Menu hierarchy: rejects ancestor cycles and recursively deletes a branch', async () => {
  const suffix = Date.now();
  const rootId = await menuService.createMenuItem(`Root ${suffix}`, `/root-${suffix}`);
  const childId = await menuService.createMenuItem(`Child ${suffix}`, `/child-${suffix}`, rootId);
  const grandchildId = await menuService.createMenuItem(
    `Grandchild ${suffix}`,
    `/grandchild-${suffix}`,
    childId
  );
  try {
    assert.equal(await menuService.updateMenuItem(rootId, { parent_id: grandchildId }), false);
    assert.equal(await menuService.deleteMenuItem(rootId), true);
    const remaining = await menuService.getMenuItems();
    assert.equal(
      remaining.some((item) => [rootId, childId, grandchildId].includes(item.id)),
      false
    );
  } finally {
    await menuService.deleteMenuItem(rootId);
    await menuService.deleteMenuItem(childId);
    await menuService.deleteMenuItem(grandchildId);
  }
});
