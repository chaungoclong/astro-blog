import { db } from '../../db/index.ts';
import { menuRepository } from '../menus/menu.repository.ts';
import { postRepository } from '../posts/post.repository.ts';
import { categoryRepository } from './category.repository.ts';
import type { Category } from './types.ts';

const CATEGORY_URL_PREFIX = '/category/';

async function isValidCategoryParent(id: number, parentId: number | null): Promise<boolean> {
  if (parentId === id) return false;
  let ancestor = parentId;
  const visited = new Set<number>();

  while (ancestor !== null) {
    if (ancestor === id || visited.has(ancestor)) return false;
    visited.add(ancestor);
    const nextParentId = await categoryRepository.findParentId(ancestor);
    if (nextParentId === undefined) return false;
    ancestor = nextParentId;
  }
  return true;
}

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    return categoryRepository.findAllWithPostCounts();
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return categoryRepository.findBySlug(slug);
  }

  async createCategory(
    name: string,
    slug: string,
    description: string = '',
    parentId: number | null = null
  ): Promise<number> {
    const position = await categoryRepository.nextPositionForParent(parentId);
    return categoryRepository.create({ name, slug, description, parentId, position });
  }

  async updateCategory(
    id: number,
    data: { name: string; slug: string; description: string; parentId: number | null }
  ): Promise<boolean> {
    const existing = await categoryRepository.findById(id);
    if (!existing) return false;

    const validParent = await isValidCategoryParent(id, data.parentId);
    if (!validParent) return false;

    return db.transaction().execute(async (trx) => {
      const updated = await categoryRepository.update(id, data, trx);
      if (existing.name !== data.name) {
        await postRepository.renameCategory(existing.name, data.name, trx);
      }
      await menuRepository.updateByUrl(
        `${CATEGORY_URL_PREFIX}${existing.slug}`,
        data.name,
        `${CATEGORY_URL_PREFIX}${data.slug}`,
        trx
      );
      return updated;
    });
  }

  async categoryPostCount(id: number): Promise<number> {
    return categoryRepository.countPostsByCategoryId(id);
  }

  async updateCategoryHierarchy(
    id: number,
    parentId: number | null,
    position: number
  ): Promise<boolean> {
    const validParent = await isValidCategoryParent(id, parentId);
    if (!validParent) return false;
    return categoryRepository.updateHierarchy(id, parentId, position);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const postCount = await categoryRepository.countPostsByCategoryId(id);
    if (postCount > 0) return false;

    return db.transaction().execute(async (trx) => {
      await categoryRepository.clearChildrenParent(id, trx);
      return categoryRepository.delete(id, trx);
    });
  }
}

export const categoryService = new CategoryService();
