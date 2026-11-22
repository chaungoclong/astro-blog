import type { APIRoute } from 'astro';
import { dbService } from '../lib/db';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const siteUrl = `${url.protocol}//${url.host}`;

  const posts = dbService.getPosts({ status: 'published', limit: 1000 });
  const categories = dbService.getCategories();
  const pages = dbService.getPages('published');

  const staticPages = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${siteUrl}/search`, changefreq: 'weekly', priority: '0.7' },
  ];

  const categoryPages = categories.map((cat) => ({
    loc: `${siteUrl}/category/${cat.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const postPages = posts.map((post) => ({
    loc: `${siteUrl}/blog/${post.slug}`,
    lastmod: new Date(post.updated_at || post.created_at).toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.9',
  }));

  const managedPages = pages.map((page) => ({ loc: `${siteUrl}/${page.slug}`, lastmod: new Date(page.updated_at || page.created_at).toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' }));
  const allPages = [...staticPages, ...managedPages, ...categoryPages, ...postPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
