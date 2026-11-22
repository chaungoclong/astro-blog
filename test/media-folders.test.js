import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMediaFolderWithin,
  isValidMediaFolderPath,
  joinMediaFolderPath,
} from '../src/api/modules/media/media-folder.service.ts';

const ROOT_FOLDER = '';
const PARENT_FOLDER = 'hello';
const CHILD_NAME = 'test2';
const CHILD_FOLDER = 'hello/test2';
const TRAVERSAL_FOLDER = 'hello/../secret';

test('Media folders: builds validated nested logical paths', () => {
  assert.equal(joinMediaFolderPath(PARENT_FOLDER, CHILD_NAME), CHILD_FOLDER);
  assert.equal(isValidMediaFolderPath(CHILD_FOLDER), true);
  assert.equal(isValidMediaFolderPath(ROOT_FOLDER), true);
  assert.equal(isValidMediaFolderPath(TRAVERSAL_FOLDER), false);
  assert.equal(joinMediaFolderPath(PARENT_FOLDER, '../secret'), null);
  assert.equal(isMediaFolderWithin('hello/test2/image', PARENT_FOLDER), true);
  assert.equal(isMediaFolderWithin('hello2', PARENT_FOLDER), false);
});
