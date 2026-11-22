import type { ColumnType, Generated } from 'kysely';

export interface MenuItemsTable {
  id: Generated<number>;
  label: string;
  url: string;
  parent_id: number | null;
  position: ColumnType<number, number | undefined, number>;
  visible: ColumnType<number, number | undefined, number>;
}

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  parent_id: number | null;
  position: number;
  visible: number;
}
