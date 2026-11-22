import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Remove Vietnamese accents and convert to URL-safe slug
 */
export function slugify(text: string): string {
  if (!text) return '';

  let str = text.toLowerCase().trim();

  // Remove accents
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[đĐ]/g, 'd');

  // Remove special chars and spaces
  str = str
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return str.replace(/^-+|-+$/g, '');
}

/**
 * Format ISO/UTC date string to Vietnamese format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Calculate approximate reading time in Vietnamese
 */
export function calculateReadingTime(content: string): string {
  if (!content) return '1 phút đọc';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} phút đọc`;
}

/**
 * Render Markdown content to safe HTML
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  try {
    return marked.parse(markdown) as string;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return markdown;
  }
}
