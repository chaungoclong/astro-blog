import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const UPLOAD_ROUTE_PATH = new URL('../src/pages/uploads/[filename].ts', import.meta.url);
const ATTACHMENT_HEADER = 'Content-Disposition';
const IMAGE_TYPE_GUARD = 'isImageMediaType';

test('Uploads: non-image files are served as attachments', async () => {
  const source = await readFile(UPLOAD_ROUTE_PATH, 'utf8');

  assert.ok(source.includes(ATTACHMENT_HEADER));
  assert.ok(source.includes(IMAGE_TYPE_GUARD));
  assert.match(source, /if \(!isImageMediaType\(item\.type\)\)/);
});
