import type { ColumnType, Generated } from 'kysely';
import type { ContentStatus } from '../../shared/types.ts';

export interface PagesTable {
  id: Generated<number>;
  title: string;
  slug: string;
  excerpt: ColumnType<string, string | undefined, string>;
  content: ColumnType<string, string | undefined, string>;
  status: ColumnType<ContentStatus, ContentStatus | undefined, ContentStatus>;
  show_in_nav: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<string, string | undefined, string>;
  updated_at: ColumnType<string, string | undefined, string>;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
  show_in_nav: number;
  created_at: string;
  updated_at: string;
}
