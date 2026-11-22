import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const MEDIA_PICKER_PATH = new URL('../src/components/MediaPicker.astro', import.meta.url);
const POST_EDIT_PATH = new URL('../src/pages/admin/posts/[id]/edit.astro', import.meta.url);
const FORM_OPEN_PATTERN = /<form\b/gi;
const INLINE_IMPORT_PATTERN = /<script\s+define:vars[^>]*>[\s\S]*?\bimport\s/gi;
const PICKER_ROOT_LABEL = 'Ổ đĩa của tôi';
const PICKER_BREADCRUMB = 'id="media-picker-breadcrumb"';
const PICKER_DIRECT_CHILDREN = 'parentFolder(candidate) === folder';
const PICKER_UPLOAD_FOLDER = "uploadData.append('folder', currentFolder)";
const PICKER_TREE_DISCLOSURE = 'picker-tree-toggle';
const PICKER_TREE_STATE = 'media-picker-expanded-folders';
const PICKER_BASENAME_LABEL = "folder ? folderLabel(folder) : 'Ổ đĩa của tôi'";

test('Post editor: MediaPicker must not render a nested form', async () => {
  const source = await readFile(MEDIA_PICKER_PATH, 'utf8');
  const formElements = source.match(FORM_OPEN_PATTERN) ?? [];

  assert.equal(
    formElements.length,
    0,
    'MediaPicker is mounted inside the post form and must not contain another form element',
  );
});

test('Post editor: MediaPicker mirrors File Manager folder navigation', async () => {
  const source = await readFile(MEDIA_PICKER_PATH, 'utf8');

  assert.ok(source.includes(PICKER_ROOT_LABEL));
  assert.ok(source.includes(PICKER_BREADCRUMB));
  assert.ok(source.includes(PICKER_DIRECT_CHILDREN));
  assert.ok(source.includes(PICKER_UPLOAD_FOLDER));
  assert.ok(source.includes(PICKER_TREE_DISCLOSURE));
  assert.ok(source.includes(PICKER_TREE_STATE));
  assert.ok(source.includes(PICKER_BASENAME_LABEL));
  assert.equal(source.includes('Tất cả / không phân loại'), false);
});

test('Post editor: imported dependencies must be bundled as a module', async () => {
  const source = await readFile(POST_EDIT_PATH, 'utf8');

  assert.doesNotMatch(
    source,
    INLINE_IMPORT_PATTERN,
    'Astro define:vars scripts are inline classic scripts and cannot contain browser imports',
  );
});
