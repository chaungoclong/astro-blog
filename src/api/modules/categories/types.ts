import type { ColumnType, Generated } from 'kysely';

export interface CategoriesTable {
  id: Generated<number>;
  name: string;
  slug: string;
  description: ColumnType<string, string | undefined, string>;
  parent_id: number | null;
  position: ColumnType<number, number | undefined, number>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count?: number;
  total_post_count?: number;
  parent_id: number | null;
  position: number;
}
