import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { Kysely } from 'kysely';
import { apiApp } from '../src/api/app.ts';
import { NodeSqliteDialect } from '../src/api/db/dialect.ts';
import { migrateDatabase } from '../src/api/db/migrate.ts';
import { SESSION_COOKIE_NAME } from '../src/api/modules/auth/constant.ts';
import { DEFAULT_ADMIN_USERNAME } from '../src/api/shared/constant.ts';
import { sessionService, userService } from '../src/api/index.ts';

const DB_INDEX_PATH = new URL('../src/api/db/index.ts', import.meta.url);
const UNAUTHORIZED_STATUS = 401;
const OK_STATUS = 200;
const CREATED_STATUS = 201;
const NOT_FOUND_STATUS = 404;

test('Serverless DB index does not execute DDL or seeders on module import', async () => {
  const source = await readFile(DB_INDEX_PATH, 'utf8');
  assert.equal(source.includes('CREATE TABLE'), false);
  assert.equal(source.includes('runSeeders'), false);
  assert.equal(source.includes('migrateDatabase'), false);
});

test('Migration script runs idempotently on an isolated in-memory SQLite database', async () => {
  const sqlite = new DatabaseSync(':memory:');
  const memDb = new Kysely({ dialect: new NodeSqliteDialect(sqlite) });

  await migrateDatabase(sqlite, memDb, { seed: true });
  await migrateDatabase(sqlite, memDb, { seed: true });

  const posts = await memDb.selectFrom('posts').select('id').execute();
  assert.ok(posts.length >= 4);
  await memDb.destroy();
});

test('Hono API: public endpoints respond and protected endpoints enforce auth', async () => {
  const catRes = await apiApp.request('/api/categories');
  assert.equal(catRes.status, OK_STATUS);
  const catJson = await catRes.json();
  assert.equal(catJson.success, true);
  assert.ok(Array.isArray(catJson.categories));

  const unauthPostRes = await apiApp.request('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Unauthorized test' }),
  });
  assert.equal(unauthPostRes.status, UNAUTHORIZED_STATUS);

  const missingRes = await apiApp.request('/api/does-not-exist');
  assert.equal(missingRes.status, NOT_FOUND_STATUS);
});

test('Hono API: authenticated post lifecycle via session cookie', async () => {
  const admin = await userService.getUserByUsername(DEFAULT_ADMIN_USERNAME);
  assert.ok(admin);

  const token = `test-hono-session-${Date.now()}`;
  await sessionService.createSession(token, String(admin.id), Date.now() + 60_000);
  const cookieHeader = `${SESSION_COOKIE_NAME}=${token}`;

  let createdId = 0;
  try {
    const createRes = await apiApp.request('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        title: 'Hono API Integration Post',
        slug: `hono-api-post-${Date.now()}`,
        content: 'Hello Hono',
        status: 'draft',
      }),
    });
    assert.equal(createRes.status, CREATED_STATUS);
    const created = await createRes.json();
    assert.equal(created.success, true);
    createdId = created.id;

    const getRes = await apiApp.request(`/api/posts/${createdId}`);
    assert.equal(getRes.status, OK_STATUS);
    const fetched = await getRes.json();
    assert.equal(fetched.post.title, 'Hono API Integration Post');

    const delRes = await apiApp.request(`/api/posts/${createdId}`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader },
    });
    assert.equal(delRes.status, OK_STATUS);
    createdId = 0;
  } finally {
    if (createdId > 0) {
      await apiApp.request(`/api/posts/${createdId}`, {
        method: 'DELETE',
        headers: { Cookie: cookieHeader },
      });
    }
    await sessionService.deleteSession(token);
  }
});
