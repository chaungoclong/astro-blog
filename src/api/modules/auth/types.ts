import type { ColumnType } from 'kysely';

export interface SessionsTable {
  token: string;
  user_id: string;
  created_at: ColumnType<string, string | undefined, string>;
  expires_at: number;
}

export interface Session {
  token: string;
  user_id: string;
  expires_at: number;
}
