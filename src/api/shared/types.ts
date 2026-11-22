import type { Kysely, Transaction } from 'kysely';
import type { Database } from '../db/schema.ts';
import type { CONTENT_STATUS, PERMISSIONS } from './constant.ts';

export type ApiEnv = {
  Variables: {
    userId: number;
  };
};

export type DbExecutor = Kysely<Database> | Transaction<Database>;

export type ContentStatus = typeof CONTENT_STATUS.PUBLISHED | typeof CONTENT_STATUS.DRAFT;
export type ContentStatusFilter = ContentStatus | typeof CONTENT_STATUS.ALL;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
