import type { ColumnType } from 'kysely';

export interface MediaTable {
  filename: string;
  folder: ColumnType<string, string | undefined, string>;
  original_name: ColumnType<string, string | undefined, string>;
  created_at: ColumnType<string, string | undefined, string>;
}

export interface MediaFoldersTable {
  name: string;
  created_at: ColumnType<string, string | undefined, string>;
}

export interface MediaMetadata {
  filename: string;
  folder: string;
  original_name: string;
  created_at: string;
}

export interface MediaReference {
  type: 'post' | 'page';
  id: number;
  title: string;
}
