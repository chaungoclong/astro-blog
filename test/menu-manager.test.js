import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dbService } from '../src/lib/db.ts';

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

test('Menu hierarchy: rejects ancestor cycles and recursively deletes a branch', () => {
  const suffix = Date.now();
  const rootId = dbService.createMenuItem(`Root ${suffix}`, `/root-${suffix}`);
  const childId = dbService.createMenuItem(`Child ${suffix}`, `/child-${suffix}`, rootId);
  const grandchildId = dbService.createMenuItem(`Grandchild ${suffix}`, `/grandchild-${suffix}`, childId);
  try {
    assert.equal(dbService.updateMenuItem(rootId, { parent_id: grandchildId }), false);
    assert.equal(dbService.deleteMenuItem(rootId), true);
    const remaining = dbService.getMenuItems();
    assert.equal(remaining.some((item) => [rootId, childId, grandchildId].includes(item.id)), false);
  } finally {
    dbService.deleteMenuItem(rootId);
    dbService.deleteMenuItem(childId);
    dbService.deleteMenuItem(grandchildId);
  }
});
