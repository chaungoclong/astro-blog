export const DEFAULT_POST_COVER_IMAGE =
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80';
export const DEFAULT_CATEGORY_NAME = 'Chung';
export const DEFAULT_AUTHOR_NAME = 'Admin';
export const DEFAULT_POSTS_LIMIT = 10;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_SORT_BY = 'created_at DESC';

export const POSTS_CONSTANTS = {
  SLUG_SUFFIX_LENGTH: 4,
  FALLBACK_SLUG_PREFIX: 'bai-viet-',
  TITLE_REQUIRED_MESSAGE: 'Tiêu đề bài viết không được để trống.',
  POST_NOT_FOUND_MESSAGE: 'Không tìm thấy bài viết.',
  POST_MISSING_MESSAGE: 'Bài viết không tồn tại.',
  CREATE_POST_ERROR_MESSAGE: 'Lỗi khi tạo bài viết.',
  UPDATE_POST_ERROR_MESSAGE: 'Lỗi khi cập nhật bài viết.',
} as const;
