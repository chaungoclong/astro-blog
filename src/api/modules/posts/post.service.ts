import type { ContentStatusFilter } from '../../shared/types.ts';
import {
  postRepository,
  type CreatePostInput,
  type PostQueryOptions,
  type UpdatePostInput,
} from './post.repository.ts';
import type { Post } from './types.ts';

export class PostService {
  async getPosts(options: PostQueryOptions = {}): Promise<Post[]> {
    return postRepository.findMany(options);
  }

  async getPostCount(
    options: { status?: ContentStatusFilter; category?: string; search?: string } = {}
  ): Promise<number> {
    return postRepository.count(options);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return postRepository.findBySlug(slug);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return postRepository.findById(id);
  }

  async createPost(data: CreatePostInput): Promise<number> {
    return postRepository.create(data);
  }

  async updatePost(id: number, data: UpdatePostInput): Promise<boolean> {
    return postRepository.update(id, data);
  }

  async deletePost(id: number): Promise<boolean> {
    return postRepository.delete(id);
  }

  async incrementViews(slug: string): Promise<void> {
    try {
      await postRepository.incrementViews(slug);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }
}

export const postService = new PostService();
