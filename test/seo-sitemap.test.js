import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWebsiteSchema, generateBlogPostingSchema, generateBreadcrumbSchema } from '../src/lib/seo.ts';

test('SEO: generateWebsiteSchema should produce valid Schema.org JSON-LD', () => {
  const jsonStr = generateWebsiteSchema('My Tech Blog', 'Chia sẻ kiến thức công nghệ', 'https://example.com');
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed['@context'], 'https://schema.org');
  assert.equal(parsed['@type'], 'WebSite');
  assert.equal(parsed.name, 'My Tech Blog');
  assert.equal(parsed.url, 'https://example.com');
  assert.equal(parsed.potentialAction['@type'], 'SearchAction');
});

test('SEO: generateBlogPostingSchema should produce complete BlogPosting metadata', () => {
  const mockPost = {
    id: 1,
    title: 'Hướng dẫn Astro 5',
    slug: 'huong-dan-astro-5',
    excerpt: 'Tối ưu hiệu năng',
    content: '# Nội dung',
    cover_image: 'https://example.com/cover.jpg',
    category: 'Lập trình Web',
    tags: 'astro, seo',
    status: 'published',
    author: 'Châu Ngọc Long',
    views: 100,
    created_at: '2026-11-20T00:00:00Z',
    updated_at: '2026-11-21T00:00:00Z',
  };

  const jsonStr = generateBlogPostingSchema(mockPost, 'https://example.com', 'Astro TechLog');
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed['@context'], 'https://schema.org');
  assert.equal(parsed['@type'], 'BlogPosting');
  assert.equal(parsed.headline, 'Hướng dẫn Astro 5');
  assert.equal(parsed.author.name, 'Châu Ngọc Long');
  assert.equal(parsed.publisher.name, 'Astro TechLog');
  assert.equal(parsed.articleSection, 'Lập trình Web');
});

test('SEO: generateBreadcrumbSchema should produce structured breadcrumbs', () => {
  const items = [
    { name: 'Trang chủ', url: 'https://example.com/' },
    { name: 'Lập trình Web', url: 'https://example.com/category/lap-trinh-web' },
    { name: 'Bài viết A', url: 'https://example.com/blog/bai-viet-a' },
  ];

  const jsonStr = generateBreadcrumbSchema(items);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed['@context'], 'https://schema.org');
  assert.equal(parsed['@type'], 'BreadcrumbList');
  assert.equal(parsed.itemListElement.length, 3);
  assert.equal(parsed.itemListElement[0].position, 1);
  assert.equal(parsed.itemListElement[2].name, 'Bài viết A');
});
