import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const MEDIA_LIBRARY_PATH = new URL('../src/pages/admin/media/index.astro', import.meta.url);
const CONTEXT_MENU_EVENT = "addEventListener('contextmenu'";
const KEYBOARD_MENU_KEY = "const MENU_KEY = 'ContextMenu'";
const REQUIRED_FOLDER_INPUT = 'required aria-required="true"';
const EXPLORER_LABEL = 'aria-label="Thư mục Media Library"';
const WORKSPACE_CONTEXT_MENU = "mediaExplorer?.addEventListener('contextmenu'";
const DYNAMIC_FOLDER_SELECTOR = ':global(.folder-row)';
const EXPLICIT_PARENT_FIELD = 'id="new-folder-parent"';
const NESTED_FOLDER_REQUEST = 'JSON.stringify({ name, parent })';
const DYNAMIC_TREE_SORT = 'sortFolderRows();';
const CONTEXT_UPLOAD_ACTION = 'id="context-upload-media"';
const CONTEXT_DELETE_ACTION = 'id="context-delete-folder"';
const UPLOAD_FOLDER_RESTORE = 'reloadAtFolder(uploadReturnFolder)';
const FOLDER_DELETE_PREVIEW = 'preview: true';
const REAL_ROOT_LABEL = 'Ổ đĩa của tôi';
const DIRECT_CHILD_FOLDER = 'data-parent-folder';
const TREE_DISCLOSURE = 'class="folder-toggle"';
const TREE_EXPANDED_STATE = "aria-expanded=\"true\"";

test('Media Library: exposes explorer folders and accessible folder creation', async () => {
  const source = await readFile(MEDIA_LIBRARY_PATH, 'utf8');

  assert.match(source, new RegExp(EXPLORER_LABEL), 'Folder navigation must be persistently visible as an explorer');
  assert.ok(source.includes(CONTEXT_MENU_EVENT), 'Folder explorer must support the native context-menu gesture');
  assert.ok(source.includes(KEYBOARD_MENU_KEY), 'Context-menu action must include a keyboard path');
  assert.ok(source.includes(REQUIRED_FOLDER_INPUT), 'Folder creation must retain required and aria-required semantics');
  assert.match(source, /id="folder-empty-state"/, 'Folder filtering must expose an explicit empty state');
  assert.ok(source.includes(WORKSPACE_CONTEXT_MENU), 'Context-menu delegation must cover the complete Media Library workspace');
  assert.ok(source.includes(DYNAMIC_FOLDER_SELECTOR), 'Dynamically created folder rows must receive the same unscoped component styles');
  assert.ok(source.includes(EXPLICIT_PARENT_FIELD), 'Folder dialog must persist the intended parent in an explicit field');
  assert.ok(source.includes(NESTED_FOLDER_REQUEST), 'Folder creation must send the selected folder as its logical parent');
  assert.ok(source.includes(DYNAMIC_TREE_SORT), 'A new subfolder must be repositioned into its parent branch before selection');
  assert.ok(source.includes(CONTEXT_UPLOAD_ACTION), 'Folder context menu must expose upload into the target folder');
  assert.ok(source.includes(CONTEXT_DELETE_ACTION), 'Folder context menu must expose folder deletion');
  assert.ok(source.includes(UPLOAD_FOLDER_RESTORE), 'Upload reload must restore the exact folder selection');
  assert.ok(source.includes(FOLDER_DELETE_PREVIEW), 'Folder deletion must load a destructive preview before confirmation');
  assert.ok(source.includes(REAL_ROOT_LABEL), 'File manager must expose one real root location');
  assert.equal(source.includes('Tất cả ảnh'), false, 'File manager must not retain an all-files pseudo-folder');
  assert.equal(source.includes('Không phân loại'), false, 'Files at root must not be presented as an unclassified pseudo-folder');
  assert.ok(source.includes(DIRECT_CHILD_FOLDER), 'Content pane must render direct child folders for navigation');
  assert.ok(source.includes(TREE_DISCLOSURE), 'Folder tree must expose a separate disclosure control');
  assert.ok(source.includes(TREE_EXPANDED_STATE), 'Folder disclosure must expose its expanded state');
});
