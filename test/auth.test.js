import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/api/modules/auth/auth.service.ts';

test('Auth: hashPassword should generate salt:hash format', () => {
  const hash = hashPassword('mySecretPass123');
  assert.ok(hash.includes(':'), 'Hash must contain salt delimiter');
  const [salt, key] = hash.split(':');
  assert.equal(salt.length, 32, 'Salt must be 16 bytes hex (32 chars)');
  assert.equal(key.length, 128, 'Key must be 64 bytes hex (128 chars)');
});

test('Auth: verifyPassword should validate correct passwords and reject wrong ones', () => {
  const password = 'AdminPassword2026!';
  const hash = hashPassword(password);

  assert.equal(verifyPassword(password, hash), true, 'Correct password must verify');
  assert.equal(verifyPassword('wrongPassword', hash), false, 'Wrong password must fail');
  assert.equal(verifyPassword('', hash), false, 'Empty password must fail');
  assert.equal(verifyPassword(password, 'invalid-hash-string'), false, 'Malformed hash must fail');
});
