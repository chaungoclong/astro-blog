import {
  CompiledQuery,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type DatabaseConnection,
  type Dialect,
  type DialectAdapter,
  type Driver,
  type Kysely,
  type QueryCompiler,
  type QueryResult,
  type DatabaseIntrospector,
} from 'kysely';
import type { DatabaseSync, SQLInputValue } from 'node:sqlite';

const STREAMING_UNSUPPORTED_MESSAGE = 'Streaming queries are not supported by NodeSqliteConnection';

class NodeSqliteConnection implements DatabaseConnection {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    const statement = this.db.prepare(compiledQuery.sql);
    const parameters = compiledQuery.parameters as SQLInputValue[];

    if (statement.columns().length > 0) {
      const rows = statement.all(...parameters) as R[];
      return { rows };
    }

    const result = statement.run(...parameters);
    return {
      insertId: BigInt(result.lastInsertRowid),
      numAffectedRows: BigInt(result.changes),
      rows: [],
    };
  }

  // eslint-disable-next-line require-yield
  async *streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
    throw new Error(STREAMING_UNSUPPORTED_MESSAGE);
  }
}

class NodeSqliteDriver implements Driver {
  private readonly db: DatabaseSync;
  private readonly connection: NodeSqliteConnection;
  private lockQueue: Promise<void> = Promise.resolve();
  private releaseCurrentLock: (() => void) | null = null;

  constructor(db: DatabaseSync) {
    this.db = db;
    this.connection = new NodeSqliteConnection(db);
  }

  async init(): Promise<void> {
    // DatabaseSync is initialized synchronously by the caller
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    let releaseNext!: () => void;
    const nextLock = new Promise<void>((resolve) => {
      releaseNext = resolve;
    });
    const previousLock = this.lockQueue;
    this.lockQueue = this.lockQueue.then(() => nextLock);
    await previousLock;
    this.releaseCurrentLock = releaseNext;
    return this.connection;
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('BEGIN'));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('COMMIT'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('ROLLBACK'));
  }

  async releaseConnection(): Promise<void> {
    if (this.releaseCurrentLock) {
      const release = this.releaseCurrentLock;
      this.releaseCurrentLock = null;
      release();
    }
  }

  async destroy(): Promise<void> {
    if (this.db.isOpen) {
      this.db.close();
    }
  }
}

export class NodeSqliteDialect implements Dialect {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  createDriver(): Driver {
    return new NodeSqliteDriver(this.db);
  }

  createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }
}
