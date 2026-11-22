import type { ColumnType, Generated } from 'kysely';
import type { ContentStatus } from '../../shared/types.ts';

export interface PostsTable {
  id: Generated<number>;
  title: string;
  slug: string;
  excerpt: ColumnType<string, string | undefined, string>;
  content: string;
  cover_image: ColumnType<string, string | undefined, string>;
  category: ColumnType<string, string | undefined, string>;
  tags: ColumnType<string, string | undefined, string>;
  status: ColumnType<ContentStatus, ContentStatus | undefined, ContentStatus>;
  author: ColumnType<string, string | undefined, string>;
  views: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<string, string | undefined, string>;
  updated_at: ColumnType<string, string | undefined, string>;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string;
  status: ContentStatus;
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}
