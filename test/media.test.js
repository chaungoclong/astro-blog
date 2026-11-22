import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_IMAGE_SIZE, MAX_MEDIA_SIZE, normalizeOriginalMediaName, safeMediaFilename, validateMediaBuffer } from '../src/lib/media.ts';

const PNG_TYPE = 'image/png';
const TEXT_TYPE = 'text/plain';
const PDF_TYPE = 'application/pdf';
const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const VALID_FILENAME = '0123456789abcdef01234567.png';
const INVALID_FILENAME = '../escape.png';
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const INVALID_HEADER = Buffer.from([0x00, 0x00, 0x00, 0x00]);
const PDF_HEADER = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const ZIP_HEADER = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const BYTE = 0;
const OVERSIZED_BUFFER = Buffer.alloc(MAX_MEDIA_SIZE + 1, BYTE);
const OVERSIZED_IMAGE_BUFFER = Buffer.alloc(MAX_IMAGE_SIZE + 1, BYTE);

test('Media: validates image signature and rejects invalid payloads', () => {
  assert.equal(validateMediaBuffer(PNG_HEADER, PNG_TYPE)?.extension, 'png');
  assert.equal(validateMediaBuffer(INVALID_HEADER, PNG_TYPE), null);
  assert.equal(validateMediaBuffer(PNG_HEADER, TEXT_TYPE), null);
  assert.equal(validateMediaBuffer(OVERSIZED_BUFFER, PNG_TYPE), null);
  assert.equal(validateMediaBuffer(OVERSIZED_IMAGE_BUFFER, PNG_TYPE), null);
  assert.equal(validateMediaBuffer(PDF_HEADER, PDF_TYPE)?.extension, 'pdf');
  assert.equal(validateMediaBuffer(ZIP_HEADER, DOCX_TYPE)?.extension, 'docx');
});

test('Media: only accepts generated filenames', () => {
  assert.equal(safeMediaFilename(VALID_FILENAME), VALID_FILENAME);
  assert.equal(safeMediaFilename(INVALID_FILENAME), null);
  assert.equal(normalizeOriginalMediaName('../reports/quarterly.pdf'), 'quarterly.pdf');
});
