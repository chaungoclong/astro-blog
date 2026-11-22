import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const MEDIA_ROUTE_PATH = new URL('../src/api/modules/media/media.route.ts', import.meta.url);
const MEDIA_HANDLER_PATH = new URL('../src/api/modules/media/media.handler.ts', import.meta.url);
const AUTH_CHECK = 'requireAuth';
const REFERENCE_LOOKUP = 'getMediaReferences';
const FORCE_GUARD = 'references.length && !force';
const RECURSIVE_FOLDER_MATCH = 'isMediaFolderWithin';

test('Media folder API: guards recursive deletion and referenced images', async () => {
  const [routeSource, handlerSource] = await Promise.all([
    readFile(MEDIA_ROUTE_PATH, 'utf8'),
    readFile(MEDIA_HANDLER_PATH, 'utf8'),
  ]);

  assert.ok(
    routeSource.includes(AUTH_CHECK),
    'Folder mutation endpoint must require an authenticated admin session'
  );
  assert.ok(
    handlerSource.includes(RECURSIVE_FOLDER_MATCH),
    'Folder deletion must include logical descendants'
  );
  assert.ok(
    handlerSource.includes(REFERENCE_LOOKUP),
    'Folder deletion must inspect content references for contained images'
  );
  assert.ok(
    handlerSource.includes(FORCE_GUARD),
    'Referenced images must require deliberate force confirmation'
  );
});
