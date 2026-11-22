import test from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/lib/db.ts';

test('Database: seed data and stats are present', () => {
  const stats = dbService.getStats();
  assert.ok(stats.totalPosts >= 4, 'Should have at least 4 seeded posts');
  assert.ok(stats.publishedPosts >= 3, 'Should have at least 3 published posts');
  assert.ok(stats.totalCategories >= 4, 'Should have at least 4 categories');
});

test('Database: Post CRUD lifecycle', () => {
  const testSlug = `test-post-crud-${Date.now()}`;
  
  // 1. Create
  const postId = dbService.createPost({
    title: 'Bài viết kiểm thử CRUD',
    slug: testSlug,
    excerpt: 'Mô tả bài viết kiểm thử',
    content: '## Nội dung test\n\nNội dung chi tiết của bài test.',
    category: 'Lập trình Web',
    status: 'draft',
    author: 'Tester',
  });
  assert.ok(postId > 0, 'Post ID must be positive integer');

  // 2. Read by ID
  const post = dbService.getPostById(postId);
  assert.ok(post, 'Post must be found by ID');
  assert.equal(post.title, 'Bài viết kiểm thử CRUD');
  assert.equal(post.status, 'draft');

  // 3. Read by Slug
  const postBySlug = dbService.getPostBySlug(testSlug);
  assert.ok(postBySlug, 'Post must be found by slug');
  assert.equal(postBySlug.id, postId);

  // 4. Update
  const updated = dbService.updatePost(postId, {
    title: 'Bài viết kiểm thử CRUD - Đã cập nhật',
    status: 'published',
  });
  assert.equal(updated, true, 'Update must return true');

  const reloaded = dbService.getPostById(postId);
  assert.equal(reloaded?.title, 'Bài viết kiểm thử CRUD - Đã cập nhật');
  assert.equal(reloaded?.status, 'published');

  // 5. Increment views
  const oldViews = reloaded?.views || 0;
  dbService.incrementViews(testSlug);
  const afterViews = dbService.getPostById(postId)?.views || 0;
  assert.equal(afterViews, oldViews + 1, 'Views must increment by 1');

  // 6. Delete
  const deleted = dbService.deletePost(postId);
  assert.equal(deleted, true, 'Delete must return true');
  assert.equal(dbService.getPostById(postId), undefined, 'Deleted post must not exist');
});

test('Database: Category CRUD lifecycle', () => {
  const testCatName = `Test Category ${Date.now()}`;
  const testCatSlug = `test-category-${Date.now()}`;

  // 1. Create
  const catId = dbService.createCategory(testCatName, testCatSlug, 'Mô tả test');
  assert.ok(catId > 0, 'Category ID must be positive integer');

  // 2. Read list
  const categories = dbService.getCategories();
  const found = categories.find((c) => c.id === catId);
  assert.ok(found, 'Created category must appear in list');
  assert.equal(found.name, testCatName);

  // 3. Delete
  const deleted = dbService.deleteCategory(catId);
  assert.equal(deleted, true, 'Category delete must return true');
});

test('Database: category rename preserves posts and used category cannot be deleted', () => {
  const unique = Date.now();
  const originalName = `Policy Category ${unique}`;
  const renamedName = `Renamed Category ${unique}`;
  const categoryId = dbService.createCategory(originalName, `policy-category-${unique}`, 'Policy test');
  const postId = dbService.createPost({
    title: 'Category policy post',
    slug: `category-policy-post-${unique}`,
    excerpt: 'Policy test',
    content: 'Draft content',
    category: originalName,
    status: 'draft',
    author: 'Test',
  });
  try {
    assert.equal(dbService.categoryPostCount(categoryId), 1);
    assert.equal(dbService.deleteCategory(categoryId), false, 'Draft posts must block category deletion');
    assert.equal(dbService.updateCategory(categoryId, { name: renamedName, slug: `renamed-category-${unique}`, description: 'Renamed', parentId: null }), true);
    assert.equal(dbService.getPostById(postId)?.category, renamedName, 'Category rename must preserve assignment');
  } finally {
    dbService.deletePost(postId);
    dbService.deleteCategory(categoryId);
  }
});

test('Database: Settings get and update', () => {
  const initialSettings = dbService.getSettings();
  assert.ok(initialSettings.site_title, 'Site title setting must exist');

  dbService.updateSetting('test_key', 'test_value_123');
  const updated = dbService.getSettings();
  assert.equal(updated.test_key, 'test_value_123');
});

test('Database: Media metadata supports logical folders', () => {
  const TEST_FILENAME = '0123456789abcdef01234567.png';
  const INITIAL_FOLDER = 'Editorial';
  const TARGET_FOLDER = 'Homepage';
  const CREATED_FOLDER = 'Campaign Assets';
  assert.equal(dbService.createMediaFolder(CREATED_FOLDER), true);
  assert.equal(dbService.getMediaFolders().includes(CREATED_FOLDER), true);
  dbService.upsertMediaMetadata(TEST_FILENAME, INITIAL_FOLDER);
  assert.equal(dbService.getMediaMetadata().find((item) => item.filename === TEST_FILENAME)?.folder, INITIAL_FOLDER);
  assert.equal(dbService.moveMediaMetadata(TEST_FILENAME, TARGET_FOLDER), true);
  assert.equal(dbService.getMediaMetadata().find((item) => item.filename === TEST_FILENAME)?.folder, TARGET_FOLDER);
  dbService.deleteMediaMetadata(TEST_FILENAME);
  dbService.deleteMediaFolder(CREATED_FOLDER);
  assert.equal(dbService.getMediaMetadata().some((item) => item.filename === TEST_FILENAME), false);
});
