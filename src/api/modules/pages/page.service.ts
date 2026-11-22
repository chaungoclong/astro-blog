import { CONTENT_STATUS } from '../../shared/constant.ts';
import type { ContentStatusFilter } from '../../shared/types.ts';
import { pageRepository, type CreatePageInput, type UpdatePageInput } from './page.repository.ts';
import type { Page } from './types.ts';

export class PageService {
  async getPages(status: ContentStatusFilter = CONTENT_STATUS.PUBLISHED): Promise<Page[]> {
    return pageRepository.findMany(status);
  }

  async getPageById(id: number): Promise<Page | undefined> {
    return pageRepository.findById(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return pageRepository.findBySlug(slug);
  }

  async createPage(data: CreatePageInput): Promise<number> {
    return pageRepository.create(data);
  }

  async updatePage(id: number, data: UpdatePageInput): Promise<boolean> {
    return pageRepository.update(id, data);
  }

  async deletePage(id: number): Promise<boolean> {
    return pageRepository.delete(id);
  }
}

export const pageService = new PageService();
