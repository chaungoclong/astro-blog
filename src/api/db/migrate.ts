import { pathToFileURL } from 'node:url';
import type { DatabaseSync } from 'node:sqlite';
import type { Kysely } from 'kysely';
import { db, rawDb } from './index.ts';
import type { Database } from './schema.ts';
import { runSeeders } from './seed.ts';

const SCHEMA_STATEMENTS = `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT DEFAULT 'Chung',
    tags TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    author TEXT DEFAULT 'Admin',
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    status TEXT DEFAULT 'draft',
    show_in_nav INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media (
    filename TEXT PRIMARY KEY,
    folder TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media_folders (
    name TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    parent_id INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
  );
`;

export function runSchemaMigrations(sqlite: DatabaseSync = rawDb): void {
  sqlite.exec(SCHEMA_STATEMENTS);

  const categoryColumns = sqlite.prepare('PRAGMA table_info(categories)').all() as {
    name: string;
  }[];
  if (!categoryColumns.some((column) => column.name === 'parent_id')) {
    sqlite.exec(
      'ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;'
    );
  }
  if (!categoryColumns.some((column) => column.name === 'position')) {
    sqlite.exec('ALTER TABLE categories ADD COLUMN position INTEGER NOT NULL DEFAULT 0;');
  }

  const mediaColumns = sqlite.prepare('PRAGMA table_info(media)').all() as { name: string }[];
  if (!mediaColumns.some((column) => column.name === 'original_name')) {
    sqlite.exec("ALTER TABLE media ADD COLUMN original_name TEXT NOT NULL DEFAULT '';");
  }
}

export async function migrateDatabase(
  sqlite: DatabaseSync = rawDb,
  kysely: Kysely<Database> = db,
  options: { seed?: boolean } = {}
): Promise<void> {
  const { seed = true } = options;
  runSchemaMigrations(sqlite);
  if (seed) {
    await runSeeders(kysely);
  }
}

const isCliEntrypoint =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliEntrypoint) {
  const skipSeed = process.argv.includes('--no-seed');
  await migrateDatabase(rawDb, db, { seed: !skipSeed });
  console.log(skipSeed ? 'Database schema migrated.' : 'Database schema migrated and seeded.');
  await db.destroy();
}
