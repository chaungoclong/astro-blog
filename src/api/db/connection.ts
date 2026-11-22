import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { Kysely } from 'kysely';
import { NodeSqliteDialect } from './dialect.ts';
import type { Database } from './schema.ts';

const DATA_DIR_NAME = 'data';
const DB_FILENAME = 'blog.db';
const SQLITE_BUSY_TIMEOUT_MS = 5000;

export const DATA_DIR = path.resolve(process.cwd(), DATA_DIR_NAME);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DB_PATH = path.join(DATA_DIR, DB_FILENAME);

export function createSqliteConnection(dbPath: string = DB_PATH): DatabaseSync {
  const sqlite = new DatabaseSync(dbPath);
  sqlite.exec(`PRAGMA busy_timeout = ${SQLITE_BUSY_TIMEOUT_MS};`);
  return sqlite;
}

export const rawDb = createSqliteConnection(DB_PATH);

export const db = new Kysely<Database>({
  dialect: new NodeSqliteDialect(rawDb),
});
