import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categoryService,
  mediaService,
  postService,
  settingService,
  statsService,
} from '../src/api/index.ts';

test('Database: seed data and stats are present', async () => {
  const stats = await statsService.getStats();
  assert.ok(stats.totalPosts >= 4, 'Should have at least 4 seeded posts');
  assert.ok(stats.publishedPosts >= 3, 'Should have at least 3 published posts');
  assert.ok(stats.totalCategories >= 4, 'Should have at least 4 categories');
});

test('Database: Post CRUD lifecycle', async () => {
  const testSlug = `test-post-crud-${Date.now()}`;

  const postId = await postService.createPost({
    title: 'Bài viết kiểm thử CRUD',
    slug: testSlug,
    excerpt: 'Mô tả bài viết kiểm thử',
    content: '## Nội dung test\n\nNội dung chi tiết của bài test.',
    category: 'Lập trình Web',
    status: 'draft',
    author: 'Tester',
  });
  assert.ok(postId > 0, 'Post ID must be positive integer');

  const post = await postService.getPostById(postId);
  assert.ok(post, 'Post must be found by ID');
  assert.equal(post.title, 'Bài viết kiểm thử CRUD');
  assert.equal(post.status, 'draft');

  const postBySlug = await postService.getPostBySlug(testSlug);
  assert.ok(postBySlug, 'Post must be found by slug');
  assert.equal(postBySlug.id, postId);

  const updated = await postService.updatePost(postId, {
    title: 'Bài viết kiểm thử CRUD - Đã cập nhật',
    status: 'published',
  });
  assert.equal(updated, true, 'Update must return true');

  const reloaded = await postService.getPostById(postId);
  assert.equal(reloaded?.title, 'Bài viết kiểm thử CRUD - Đã cập nhật');
  assert.equal(reloaded?.status, 'published');

  const oldViews = reloaded?.views || 0;
  await postService.incrementViews(testSlug);
  const afterViews = (await postService.getPostById(postId))?.views || 0;
  assert.equal(afterViews, oldViews + 1, 'Views must increment by 1');

  const deleted = await postService.deletePost(postId);
  assert.equal(deleted, true, 'Delete must return true');
  assert.equal(await postService.getPostById(postId), undefined, 'Deleted post must not exist');
});

test('Database: Category CRUD lifecycle', async () => {
  const testCatName = `Test Category ${Date.now()}`;
  const testCatSlug = `test-category-${Date.now()}`;

  const catId = await categoryService.createCategory(testCatName, testCatSlug, 'Mô tả test');
  assert.ok(catId > 0, 'Category ID must be positive integer');

  const categories = await categoryService.getCategories();
  const found = categories.find((c) => c.id === catId);
  assert.ok(found, 'Created category must appear in list');
  assert.equal(found.name, testCatName);

  const deleted = await categoryService.deleteCategory(catId);
  assert.equal(deleted, true, 'Category delete must return true');
});

test('Database: category rename preserves posts and used category cannot be deleted', async () => {
  const unique = Date.now();
  const originalName = `Policy Category ${unique}`;
  const renamedName = `Renamed Category ${unique}`;
  const categoryId = await categoryService.createCategory(
    originalName,
    `policy-category-${unique}`,
    'Policy test'
  );
  const postId = await postService.createPost({
    title: 'Category policy post',
    slug: `category-policy-post-${unique}`,
    excerpt: 'Policy test',
    content: 'Draft content',
    category: originalName,
    status: 'draft',
    author: 'Test',
  });
  try {
    assert.equal(await categoryService.categoryPostCount(categoryId), 1);
    assert.equal(
      await categoryService.deleteCategory(categoryId),
      false,
      'Draft posts must block category deletion'
    );
    assert.equal(
      await categoryService.updateCategory(categoryId, {
        name: renamedName,
        slug: `renamed-category-${unique}`,
        description: 'Renamed',
        parentId: null,
      }),
      true
    );
    assert.equal(
      (await postService.getPostById(postId))?.category,
      renamedName,
      'Category rename must preserve assignment'
    );
  } finally {
    await postService.deletePost(postId);
    await categoryService.deleteCategory(categoryId);
  }
});

test('Database: Settings get and update', async () => {
  const initialSettings = await settingService.getSettings();
  assert.ok(initialSettings.site_title, 'Site title setting must exist');

  await settingService.updateSetting('test_key', 'test_value_123');
  const updated = await settingService.getSettings();
  assert.equal(updated.test_key, 'test_value_123');
});

test('Database: Media metadata supports logical folders', async () => {
  const TEST_FILENAME = '0123456789abcdef01234567.png';
  const INITIAL_FOLDER = 'Editorial';
  const TARGET_FOLDER = 'Homepage';
  const CREATED_FOLDER = 'Campaign Assets';
  assert.equal(await mediaService.createMediaFolder(CREATED_FOLDER), true);
  assert.equal((await mediaService.getMediaFolders()).includes(CREATED_FOLDER), true);
  await mediaService.upsertMediaMetadata(TEST_FILENAME, INITIAL_FOLDER);
  assert.equal(
    (await mediaService.getMediaMetadata()).find((item) => item.filename === TEST_FILENAME)?.folder,
    INITIAL_FOLDER
  );
  assert.equal(await mediaService.moveMediaMetadata(TEST_FILENAME, TARGET_FOLDER), true);
  assert.equal(
    (await mediaService.getMediaMetadata()).find((item) => item.filename === TEST_FILENAME)?.folder,
    TARGET_FOLDER
  );
  await mediaService.deleteMediaMetadata(TEST_FILENAME);
  await mediaService.deleteMediaFolder(CREATED_FOLDER);
  assert.equal(
    (await mediaService.getMediaMetadata()).some((item) => item.filename === TEST_FILENAME),
    false
  );
});
