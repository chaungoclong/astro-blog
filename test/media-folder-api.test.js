import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const FOLDER_API_PATH = new URL('../src/pages/api/media/folders.ts', import.meta.url);
const AUTH_CHECK = 'isAuthenticated(cookies)';
const REFERENCE_LOOKUP = 'getMediaReferences';
const FORCE_GUARD = 'references.length && !force';
const RECURSIVE_FOLDER_MATCH = 'isMediaFolderWithin';

test('Media folder API: guards recursive deletion and referenced images', async () => {
  const source = await readFile(FOLDER_API_PATH, 'utf8');

  assert.ok(source.includes(AUTH_CHECK), 'Folder mutation endpoint must require an authenticated admin session');
  assert.ok(source.includes(RECURSIVE_FOLDER_MATCH), 'Folder deletion must include logical descendants');
  assert.ok(source.includes(REFERENCE_LOOKUP), 'Folder deletion must inspect content references for contained images');
  assert.ok(source.includes(FORCE_GUARD), 'Referenced images must require deliberate force confirmation');
});
