import { pageRepository } from '../pages/page.repository.ts';
import { postRepository } from '../posts/post.repository.ts';
import { mediaRepository } from './media.repository.ts';
import type { MediaMetadata, MediaReference } from './types.ts';

export class MediaService {
  async getMediaMetadata(): Promise<MediaMetadata[]> {
    return mediaRepository.findAllMetadata();
  }

  async getMediaFolders(): Promise<string[]> {
    return mediaRepository.findAllFolders();
  }

  async createMediaFolder(name: string): Promise<boolean> {
    return mediaRepository.createFolder(name);
  }

  async deleteMediaFolder(name: string): Promise<boolean> {
    return mediaRepository.deleteFolder(name);
  }

  async upsertMediaMetadata(
    filename: string,
    folder: string = '',
    originalName: string = filename
  ): Promise<void> {
    await mediaRepository.upsertMetadata(filename, folder, originalName);
  }

  async moveMediaMetadata(filename: string, folder: string): Promise<boolean> {
    return mediaRepository.moveMetadata(filename, folder);
  }

  async deleteMediaMetadata(filename: string): Promise<void> {
    await mediaRepository.deleteMetadata(filename);
  }

  async getMediaReferences(url: string): Promise<MediaReference[]> {
    const [posts, pages] = await Promise.all([
      postRepository.findMediaReferences(url),
      pageRepository.findMediaReferences(url),
    ]);

    return [
      ...posts.map((item) => ({ ...item, type: 'post' as const })),
      ...pages.map((item) => ({ ...item, type: 'page' as const })),
    ];
  }
}

export const mediaService = new MediaService();
