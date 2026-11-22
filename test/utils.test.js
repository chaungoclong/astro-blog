import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify, formatDate, calculateReadingTime, renderMarkdown } from '../src/lib/utils.ts';

test('Utility: slugify should convert Vietnamese text to clean URL slug', () => {
  assert.equal(slugify('Lập trình Web hiện đại 2026'), 'lap-trinh-web-hien-dai-2026');
  assert.equal(slugify('Điện toán đám mây & AI!'), 'dien-toan-dam-may-ai');
  assert.equal(slugify('Đà Nẵng & Hà Nội & TP. Hồ Chí Minh'), 'da-nang-ha-noi-tp-ho-chi-minh');
  assert.equal(slugify('   ---Multiple---Spaces   and---Dashes---  '), 'multiple-spaces-and-dashes');
  assert.equal(slugify(''), '');
});

test('Utility: formatDate should format date string into DD/MM/YYYY', () => {
  const formatted = formatDate('2026-11-22T10:00:00Z');
  assert.match(formatted, /\d{2}\/\d{2}\/\d{4}/);
  assert.equal(formatDate('invalid-date'), 'invalid-date');
  assert.equal(formatDate(''), '');
});

test('Utility: calculateReadingTime should estimate reading minutes', () => {
  const shortText = 'Đây là một đoạn văn ngắn.';
  assert.equal(calculateReadingTime(shortText), '1 phút đọc');

  // Generate 500 words
  const longText = Array(500).fill('từ').join(' ');
  assert.equal(calculateReadingTime(longText), '3 phút đọc');
});

test('Utility: renderMarkdown should render markdown to HTML', () => {
  const md = '# Tiêu đề bài viết\n\n**Chữ đậm** và *chữ nghiêng*.\n\n```js\nconsole.log("Astro");\n```';
  const html = renderMarkdown(md);
  
  assert.match(html, /<h1.*>Tiêu đề bài viết<\/h1>/);
  assert.match(html, /<strong>Chữ đậm<\/strong>/);
  assert.match(html, /<em>chữ nghiêng<\/em>/);
  assert.match(html, /<code.*>console\.log\(&quot;Astro&quot;\);/);
});
