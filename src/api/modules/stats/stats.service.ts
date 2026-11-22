import { CONTENT_STATUS } from '../../shared/constant.ts';
import { categoryRepository } from '../categories/category.repository.ts';
import { pageRepository } from '../pages/page.repository.ts';
import { postRepository } from '../posts/post.repository.ts';
import type { DashboardStats } from './types.ts';

export class StatsService {
  async getStats(): Promise<DashboardStats> {
    const [totalPosts, publishedPosts, draftPosts, totalViews, totalCategories, totalPages] =
      await Promise.all([
        postRepository.count({ status: CONTENT_STATUS.ALL }),
        postRepository.count({ status: CONTENT_STATUS.PUBLISHED }),
        postRepository.count({ status: CONTENT_STATUS.DRAFT }),
        postRepository.sumViews(),
        categoryRepository.count(),
        pageRepository.count(),
      ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalCategories,
      totalPages,
    };
  }
}

export const statsService = new StatsService();
