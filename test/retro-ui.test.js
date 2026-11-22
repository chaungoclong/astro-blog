import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('admin navigation separates access concerns and provides breadcrumbs', () => {
  const layout = read('src/layouts/AdminLayout.astro');
  for (const route of ['/admin/users', '/admin/roles', '/admin/permissions']) assert.ok(layout.includes(`href="${route}"`));
  assert.match(layout, /aria-label="Breadcrumb"/);
  assert.match(layout, /max-w-\[100rem\]/);
});

test('long admin editors keep save actions reachable', () => {
  assert.match(read('src/pages/admin/posts/new.astro'), /admin-sticky-actions/);
  assert.match(read('src/pages/admin/posts/[id]/edit.astro'), /admin-sticky-actions/);
  assert.match(read('src/components/PageEditor.astro'), /admin-save-panel/);
});

test('public chrome stays content-first and deep routes expose breadcrumbs', () => {
  const header = read('src/components/Header.astro');
  const footer = read('src/components/Footer.astro');
  assert.match(header, /public-header/); assert.doesNotMatch(header, /\/admin/);
  assert.match(footer, /public-footer-grid/); assert.doesNotMatch(footer, /\/admin/);
  assert.match(read('src/pages/category/[slug].astro'), /Breadcrumbs/);
  assert.match(read('src/pages/[slug].astro'), /Breadcrumbs/);
  assert.match(read('src/pages/blog/[slug].astro'), /aria-label="Breadcrumb"/);
});

test('retro geometry and homepage alignment use shared system tokens', () => {
  const styles = read('src/styles/global.css');
  const home = read('src/pages/index.astro');
  assert.match(styles, /--retro-radius:/);
  assert.match(styles, /body \[class\*="rounded"\]/);
  assert.match(styles, /\.public-content-rail/);
  assert.ok((home.match(/public-content-rail/g)?.length || 0) >= 3);
  assert.match(home, /home-intro-grid/);
  assert.match(home, /home-featured-card/);
  assert.match(home, /home-feed-item/);
  assert.match(home, /home-discovery-layout/);
  assert.doesNotMatch(home, /lg:grid-cols-12/);
  assert.doesNotMatch(home, /lg:col-span-8/);
});

test('media folders and picker use the shared retro radius', () => {
  const manager = read('src/pages/admin/media/index.astro');
  const picker = read('src/components/MediaPicker.astro');
  for (const source of [manager, picker]) {
    assert.doesNotMatch(source, /border-radius:\s*(?:999px|\.[0-9]+rem)/);
    assert.match(source, /border-radius:var\(--retro-radius\)/);
  }
});

test('users are compact and category UI exposes policy-aware edit/delete', () => {
  const users = read('src/pages/admin/users/index.astro');
  const categories = read('src/pages/admin/categories/index.astro');
  const categoryApi = read('src/pages/api/categories/[id].ts');
  assert.match(users, /compact-user-form/);
  assert.match(users, /xl:grid-cols-\[22rem_/);
  assert.match(categories, /edit-cat-btn/);
  assert.match(categories, /delete-category-dialog/);
  assert.match(categories, /total_post_count/);
  assert.match(categoryApi, /status:\s*409/);
});
