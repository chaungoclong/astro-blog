import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ALL_PERMISSIONS, DEFAULT_ADMIN_USERNAME, SUPER_ADMIN_ROLE } from './permissions.ts';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'blog.db');
const SQLITE_BUSY_TIMEOUT_MS = 5000;
// Singleton DB instance
const db = new DatabaseSync(DB_PATH);
db.exec(`PRAGMA busy_timeout = ${SQLITE_BUSY_TIMEOUT_MS};`);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT DEFAULT 'Chung',
    tags TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    author TEXT DEFAULT 'Admin',
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    status TEXT DEFAULT 'draft',
    show_in_nav INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media (
    filename TEXT PRIMARY KEY,
    folder TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media_folders (
    name TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, label TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE);
  CREATE TABLE IF NOT EXISTS user_roles (user_id INTEGER NOT NULL, role_id INTEGER NOT NULL, PRIMARY KEY (user_id, role_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS role_permissions (role_id INTEGER NOT NULL, permission_id INTEGER NOT NULL, PRIMARY KEY (role_id, permission_id), FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE, FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    parent_id INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
  );
`);

const categoryColumns = db.prepare('PRAGMA table_info(categories)').all() as { name: string }[];
if (!categoryColumns.some((column) => column.name === 'parent_id')) db.exec('ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;');
if (!categoryColumns.some((column) => column.name === 'position')) db.exec('ALTER TABLE categories ADD COLUMN position INTEGER NOT NULL DEFAULT 0;');
const mediaColumns = db.prepare('PRAGMA table_info(media)').all() as { name: string }[];
if (!mediaColumns.some((column) => column.name === 'original_name')) db.exec("ALTER TABLE media ADD COLUMN original_name TEXT NOT NULL DEFAULT '';");

// Types
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string;
  status: 'published' | 'draft';
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count?: number;
  total_post_count?: number;
  parent_id: number | null;
  position: number;
}

export interface User { id: number; username: string; display_name: string; active: number; created_at: string; roles?: string[]; }
export interface Role { id: number; name: string; label: string; permissions?: string[]; }
export interface MenuItem { id: number; label: string; url: string; parent_id: number | null; position: number; visible: number; }

export interface Page {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  show_in_nav: number;
  created_at: string;
  updated_at: string;
}

export interface MediaMetadata {
  filename: string;
  folder: string;
  original_name: string;
  created_at: string;
}

export interface Settings {
  site_title: string;
  site_subtitle: string;
  site_description: string;
  author_name: string;
  admin_username: string;
  admin_password_hash: string;
  posts_per_page: string;
  [key: string]: string;
}

// Password helper for seeding
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Seed Initial Data if empty
function seedDatabase() {
  const postCount = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as any)?.count || 0;
  if (postCount === 0) {
    // 1. Categories
    const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)');
    insertCat.run('Lập trình Web', 'lap-trinh-web', 'Các bài viết về công nghệ front-end, back-end và kiến trúc web hiện đại.');
    insertCat.run('Astro Framework', 'astro-framework', 'Khám phá Astro - framework tối ưu hóa hiệu năng với Island Architecture.');
    insertCat.run('Kiến trúc hệ thống', 'kien-truc-he-thong', 'Thiết kế hệ thống, microservices, database và các giải pháp scalable.');
    insertCat.run('Trí tuệ nhân tạo', 'tri-tue-nhan-tao', 'Ứng dụng AI, LLM và các công cụ lập trình thông minh trong thực tế.');

    // 2. Settings
    const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('site_title', 'Astro TechLog');
    insertSetting.run('site_subtitle', 'Blog công nghệ, lập trình hiện đại & chia sẻ kiến thức');
    insertSetting.run('site_description', 'Nền tảng blog công nghệ hiệu năng cao xây dựng bằng Astro 5 & SQLite.');
    insertSetting.run('author_name', 'Châu Ngọc Long');
    insertSetting.run('admin_username', 'admin');
    insertSetting.run('admin_password_hash', hashPassword('admin123'));
    insertSetting.run('posts_per_page', '6');

    // 3. Sample Posts
    const insertPost = db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, cover_image, category, tags, status, author, views, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
    `);

    insertPost.run(
      'Khởi đầu với Astro 5: Framework Đỉnh Cao Cho Website Nội Dung',
      'khoi-dau-voi-astro-5-framework-dinh-cao',
      'Tìm hiểu tại sao Astro trở thành lựa chọn hàng đầu cho các website nội dung với kiến trúc Islands Architecture và Zero JS by default.',
      `# Khởi đầu với Astro 5: Framework Đỉnh Cao Cho Website Nội Dung

Astro là một web framework hiện đại được thiết kế riêng cho các trang web tập trung vào nội dung như blog, trang tin tức, portfolio và tài liệu kỹ thuật.

## Tại sao Astro lại vượt trội?

1. **Zero JavaScript mặc định:** Astro biên dịch toàn bộ mã nguồn thành HTML tĩnh thuần túy. Trình duyệt tải trang ngay tức thì mà không cần nạp hàng megabyte JavaScript không cần thiết.
2. **Kiến trúc Islands (Islands Architecture):** Chỉ những phần tương tác (interactive widgets) như thanh tìm kiếm, bình luận, giỏ hàng mới tải JavaScript độc lập.
3. **Hỗ trợ đa Framework:** Bạn có thể kết hợp React, Vue, Svelte, Preact trong cùng một dự án một cách tự nhiên.
4. **Content Collections & SSR mạnh mẽ:** Quản lý nội dung có schema kiểm tra chặt chẽ và khả năng render động linh hoạt.

\`\`\`typescript
// Ví dụ một component Astro siêu đơn giản
---
const title = "Chào mừng bạn đến với Astro!";
const posts = await getPosts();
---
<article class="prose max-w-none">
  <h1>{title}</h1>
  <ul>
    {posts.map(p => <li><a href={\`/blog/\${p.slug}\`}>{p.title}</a></li>)}
  </ul>
</article>
\`\`\`

> "Astro biến việc xây dựng website tốc độ cao thành mặc định, thay vì là một công việc tối ưu hóa gian khổ."

### Kết luận

Nếu bạn đang tìm kiếm một framework để làm blog, trang tin hoặc landing page tối ưu điểm SEO 100/100, Astro chắc chắn là sự lựa chọn không thể bỏ qua!`,
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      'Astro Framework',
      'astro, webdev, performance, frontend',
      'published',
      'Châu Ngọc Long',
      152,
      '-2 days',
      '-2 days'
    );

    insertPost.run(
      'Tối Ưu Hóa Lưu Trữ với SQLite và Node.js Built-in DatabaseSync',
      'toi-uu-hoa-luu-tru-voi-sqlite-va-nodejs',
      'Khám phá module node:sqlite mới nhất trong Node.js 22+, giúp bạn xây dựng database nhúng siêu tốc mà không cần cài đặt thêm bất kỳ thư viện C++ native nào.',
      `# Tối Ưu Hóa Lưu Trữ với SQLite và Node.js Built-in DatabaseSync

Từ phiên bản Node.js 22.5+, đội ngũ phát triển Node.js đã chính thức tích hợp SQLite trực tiếp vào core thông qua module \`node:sqlite\`. Đây là một bước ngoặt lớn cho các ứng dụng web nhỏ và vừa!

## Lợi ích khi sử dụng node:sqlite

- **Không cần biên dịch native:** Không còn nỗi ác mộng \`node-gyp\`, Python hay visual C++ build tools khi triển khai trên server hoặc Docker.
- **Tốc độ đọc/ghi đồng bộ cực nhanh:** Với \`DatabaseSync\`, các câu truy vấn thực thi tức thì mà không tốn chi phí overhead của event loop async cho database cục bộ.
- **Dữ liệu gói gọn trong một file:** Dễ dàng sao lưu, di chuyển hoặc chạy trên bất kỳ VPS nào với chi phí 0 đồng cho database hosting.

\`\`\`javascript
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/blog.db');
db.exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT)');

const insert = db.prepare('INSERT INTO notes (title) VALUES (?)');
insert.run('Học Astro và SQLite');

const rows = db.prepare('SELECT * FROM notes').all();
console.log(rows);
\`\`\`

## Khi nào nên dùng SQLite cho Blog & CMS?

SQLite hoàn toàn có thể xử lý hàng triệu lượt truy cập mỗi ngày nếu cấu hình WAL mode (Write-Ahead Logging). Đối với một blog cá nhân, trang tin công ty hay portfolio, SQLite mang lại sự đơn giản tối đa và độ tin cậy vượt trội qua năm tháng.`,
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
      'Kiến trúc hệ thống',
      'sqlite, nodejs, backend, database',
      'published',
      'Châu Ngọc Long',
      88,
      '-1 days',
      '-1 days'
    );

    insertPost.run(
      'Xây Dựng Tư Duy Thiết Kế Giao Diện UI/UX Cho Lập Trình Viên',
      'xay-dung-tu-duy-thiet-ke-giao-dien-ui-ux',
      'Những nguyên tắc cốt lõi về khoảng trắng, typography, độ tương phản và phân cấp thị giác giúp lập trình viên tự tin tạo ra sản phẩm đẹp mắt.',
      `# Xây Dựng Tư Duy Thiết Kế Giao Diện UI/UX Cho Lập Trình Viên

Nhiều lập trình viên cảm thấy bối rối khi phải tự tay thiết kế giao diện từ đầu. Tuy nhiên, thiết kế giao diện hiện đại phần lớn tuân theo các quy luật có tính logic cao.

## 4 Nguyên tắc quan trọng nhất

### 1. Phân cấp thị giác (Visual Hierarchy)
Người dùng không đọc hết trang web, họ quét (scan). Hãy đảm bảo tiêu đề H1, H2, H3 có sự khác biệt rõ rệt về kích thước (\`text-3xl\`, \`text-xl\`) và trọng lượng (\`font-bold\`, \`font-semibold\`).

### 2. Khoảng trắng (White Space / Spacing)
Đừng sợ khoảng trắng! Khoảng trắng giúp mắt người xem được nghỉ ngơi và nhóm các thành phần liên quan lại với nhau. Hãy duy trì tỉ lệ spacing nhất quán (e.g. 4px, 8px, 16px, 24px, 32px).

### 3. Màu sắc và Độ tương phản
- Chọn 1 màu chủ đạo (Primary Color).
- Chọn 1 màu tạo điểm nhấn (Accent Color) cho các nút Call-to-Action.
- Sử dụng màu xám trung tính (Slate, Gray, Zinc) cho nền và văn bản để tránh mỏi mắt.

### 4. Micro-interactions
Thêm hiệu ứng hover, transition nhẹ nhàng (150ms - 200ms) sẽ làm sản phẩm trông cao cấp và chuyên nghiệp hơn rất nhiều!`,
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
      'Lập trình Web',
      'ui, ux, design, tailwindcss',
      'published',
      'Châu Ngọc Long',
      45,
      '-12 hours',
      '-12 hours'
    );

    insertPost.run(
      'Bản nháp: Khám Phá AI Agent và Kỷ Nguyên Tự Động Hóa 2026',
      'kham-pha-ai-agent-ky-nguyen-tu-dong-hoa',
      'Tài liệu phác thảo nghiên cứu về các mô hình Agentic AI, Autonomous Workflows và tương lai của kỹ nghệ phần mềm.',
      `# Khám Phá AI Agent và Kỷ Nguyên Tự Động Hóa 2026

Bài viết đang trong giai đoạn soạn thảo. Nội dung sẽ bao gồm:
- So sánh Chatbot thông thường vs Autonomous Agent.
- Cơ chế ReAct (Reasoning + Acting) và Function Calling.
- Triển khai Subagents trong bài toán thực tế.`,
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      'Trí tuệ nhân tạo',
      'ai, agent, automation',
      'draft',
      'Châu Ngọc Long',
      0,
      '-3 hours',
      '-3 hours'
    );
  }
}

// Call seed once on load
seedDatabase();

function seedAccessControl(): void {
  const settings = Object.fromEntries((db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]).map((row) => [row.key, row.value]));
  const username = settings.admin_username || DEFAULT_ADMIN_USERNAME;
  const passwordHash = settings.admin_password_hash;
  if (!passwordHash) return;
  db.prepare('INSERT OR IGNORE INTO users (username, display_name, password_hash) VALUES (?, ?, ?)').run(username, settings.author_name || username, passwordHash);
  db.prepare('INSERT OR IGNORE INTO roles (name, label) VALUES (?, ?)').run(SUPER_ADMIN_ROLE, 'Quản trị toàn quyền');
  const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(SUPER_ADMIN_ROLE) as { id: number };
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number };
  db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)').run(user.id, role.id);
  for (const permission of ALL_PERMISSIONS) {
    db.prepare('INSERT OR IGNORE INTO permissions (name) VALUES (?)').run(permission);
    const permissionRow = db.prepare('SELECT id FROM permissions WHERE name = ?').get(permission) as { id: number };
    db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)').run(role.id, permissionRow.id);
  }
}

seedAccessControl();

const MENU_MIGRATION_KEY = 'menu_migration_version';
const MENU_MIGRATION_VERSION = '4';
const HOME_MENU_LABEL = 'Trang chủ';
const CATEGORY_MENU_LABEL = 'Chuyên mục';
const ABOUT_MENU_LABEL = 'Giới thiệu';

function seedCurrentNavigation(): void {
  const migration = db.prepare('SELECT value FROM settings WHERE key = ?').get(MENU_MIGRATION_KEY) as { value: string } | undefined;
  if (migration?.value === MENU_MIGRATION_VERSION) return;
  const insert = db.prepare('INSERT INTO menu_items (label, url, parent_id, position) VALUES (?, ?, ?, ?)');
  let rootPosition = (db.prepare('SELECT COALESCE(MAX(position), -1) + 1 position FROM menu_items WHERE parent_id IS NULL').get() as { position: number }).position;
  const ensureRoot = (label: string, url: string) => {
    const existing = db.prepare('SELECT id FROM menu_items WHERE parent_id IS NULL AND label = ? AND url = ?').get(label, url) as { id: number } | undefined;
    return existing?.id ?? Number(insert.run(label, url, null, rootPosition++).lastInsertRowid);
  };
  ensureRoot(HOME_MENU_LABEL, '/');
  const pages = db.prepare("SELECT title, slug FROM pages WHERE status = 'published' AND show_in_nav = 1 ORDER BY updated_at DESC").all() as { title: string; slug: string }[];
  pages.forEach((page) => ensureRoot(page.title, `/${page.slug}`));
  const categoryRoot = ensureRoot(CATEGORY_MENU_LABEL, '/');
  const categories = db.prepare('SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id IS NOT NULL, position, name').all() as { id: number; name: string; slug: string; parent_id: number | null }[];
  const categoryMenuIds = new Map<number, number>();
  categories.forEach((category, position) => {
    const parentId = category.parent_id ? categoryMenuIds.get(category.parent_id) || categoryRoot : categoryRoot;
    const url = `/category/${category.slug}`;
    const existing = db.prepare('SELECT id FROM menu_items WHERE url = ?').get(url) as { id: number } | undefined;
    const menuId = existing?.id ?? Number(insert.run(category.name, url, parentId, position).lastInsertRowid);
    if (existing) db.prepare('UPDATE menu_items SET parent_id = ?, position = ? WHERE id = ?').run(parentId, position, menuId);
    categoryMenuIds.set(category.id, menuId);
  });
  ensureRoot(ABOUT_MENU_LABEL, '/about');
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(MENU_MIGRATION_KEY, MENU_MIGRATION_VERSION);
}

seedCurrentNavigation();

// Heal any null created_at dates
db.exec("UPDATE posts SET created_at = datetime('now'), updated_at = datetime('now') WHERE created_at IS NULL OR created_at = '';");

// Export Database Methods
export const dbService = {
  // Posts
  getPosts(options: {
    status?: 'published' | 'draft' | 'all';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  } = {}): Post[] {
    const { status = 'published', category, search, limit = 10, offset = 0, sortBy = 'created_at DESC' } = options;

    let query = 'SELECT * FROM posts WHERE 1=1';
    const params: any[] = [];

    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return db.prepare(query).all(...params) as unknown as Post[];
  },

  getPostCount(options: {
    status?: 'published' | 'draft' | 'all';
    category?: string;
    search?: string;
  } = {}): number {
    const { status = 'published', category, search } = options;

    let query = 'SELECT COUNT(*) as count FROM posts WHERE 1=1';
    const params: any[] = [];

    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const row = db.prepare(query).get(...params) as any;
    return row?.count || 0;
  },

  getPostBySlug(slug: string): Post | undefined {
    return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as unknown as Post | undefined;
  },

  getPostById(id: number): Post | undefined {
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as unknown as Post | undefined;
  },

  createPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    cover_image?: string;
    category?: string;
    tags?: string;
    status?: 'published' | 'draft';
    author?: string;
  }): number {
    const stmt = db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, cover_image, category, tags, status, author, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      data.title,
      data.slug,
      data.excerpt || '',
      data.content,
      data.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
      data.category || 'Chung',
      data.tags || '',
      data.status || 'draft',
      data.author || 'Admin'
    );

    return Number(result.lastInsertRowid);
  },

  updatePost(id: number, data: Partial<Post>): boolean {
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['title', 'slug', 'excerpt', 'content', 'cover_image', 'category', 'tags', 'status', 'author'];
    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push((data as any)[field]);
      }
    }

    if (fields.length === 0) return false;

    fields.push("updated_at = datetime('now')");
    params.push(id);

    const query = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);
    return Number(result.changes) > 0;
  },

  deletePost(id: number): boolean {
    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  },

  incrementViews(slug: string): void {
    try {
      db.prepare('UPDATE posts SET views = views + 1 WHERE slug = ?').run(slug);
    } catch (e) {
      console.error('Error incrementing views:', e);
    }
  },

  // Categories
  getCategories(): Category[] {
    const query = `
      SELECT c.*, SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) as post_count, COUNT(p.id) as total_post_count
      FROM categories c
      LEFT JOIN posts p ON p.category = c.name
      GROUP BY c.id
      ORDER BY c.parent_id IS NOT NULL, c.position ASC, c.name ASC
    `;
    return db.prepare(query).all() as unknown as Category[];
  },

  getCategoryBySlug(slug: string): Category | undefined {
    return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as unknown as Category | undefined;
  },

  createCategory(name: string, slug: string, description: string = '', parentId: number | null = null): number {
    const stmt = db.prepare('INSERT INTO categories (name, slug, description, parent_id, position) VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM categories WHERE parent_id IS ?))');
    const result = stmt.run(name, slug, description, parentId, parentId);
    return Number(result.lastInsertRowid);
  },

  updateCategory(id: number, data: { name: string; slug: string; description: string; parentId: number | null }): boolean {
    const existing = db.prepare('SELECT name, slug FROM categories WHERE id = ?').get(id) as { name: string; slug: string } | undefined;
    if (!existing || data.parentId === id) return false;
    let ancestor = data.parentId;
    while (ancestor !== null) {
      if (ancestor === id) return false;
      const row = db.prepare('SELECT parent_id FROM categories WHERE id = ?').get(ancestor) as { parent_id: number | null } | undefined;
      if (!row) return false;
      ancestor = row.parent_id;
    }
    db.exec('BEGIN');
    try {
      const result = db.prepare('UPDATE categories SET name = ?, slug = ?, description = ?, parent_id = ? WHERE id = ?').run(data.name, data.slug, data.description, data.parentId, id);
      if (existing.name !== data.name) db.prepare('UPDATE posts SET category = ? WHERE category = ?').run(data.name, existing.name);
      db.prepare('UPDATE menu_items SET label = ?, url = ? WHERE url = ?').run(data.name, `/category/${data.slug}`, `/category/${existing.slug}`);
      db.exec('COMMIT');
      return Number(result.changes) > 0;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  },

  categoryPostCount(id: number): number {
    const row = db.prepare('SELECT COUNT(p.id) AS count FROM categories c LEFT JOIN posts p ON p.category = c.name WHERE c.id = ?').get(id) as { count: number } | undefined;
    return Number(row?.count || 0);
  },

  updateCategoryHierarchy(id: number, parentId: number | null, position: number): boolean {
    if (parentId === id) return false;
    let ancestor = parentId;
    while (ancestor !== null) {
      if (ancestor === id) return false;
      const row = db.prepare('SELECT parent_id FROM categories WHERE id = ?').get(ancestor) as { parent_id: number | null } | undefined;
      if (!row) return false;
      ancestor = row.parent_id;
    }
    return Number(db.prepare('UPDATE categories SET parent_id = ?, position = ? WHERE id = ?').run(parentId, position, id).changes) > 0;
  },

  deleteCategory(id: number): boolean {
    if (this.categoryPostCount(id) > 0) return false;
    db.prepare('UPDATE categories SET parent_id = NULL WHERE parent_id = ?').run(id);
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  },

  // Menus
  getMenuItems(visibleOnly: boolean = false): MenuItem[] {
    const query = `SELECT * FROM menu_items${visibleOnly ? ' WHERE visible = 1' : ''} ORDER BY parent_id IS NOT NULL, position ASC, id ASC`;
    return db.prepare(query).all() as unknown as MenuItem[];
  },
  createMenuItem(label: string, url: string, parentId: number | null = null): number {
    if (parentId !== null && !db.prepare('SELECT id FROM menu_items WHERE id = ?').get(parentId)) return 0;
    const result = db.prepare('INSERT INTO menu_items (label, url, parent_id, position) VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM menu_items WHERE parent_id IS ?))').run(label, url, parentId, parentId);
    return Number(result.lastInsertRowid);
  },
  updateMenuItem(id: number, data: { label?: string; url?: string; parent_id?: number | null; position?: number; visible?: boolean }): boolean {
    if (data.parent_id === id) return false;
    if (data.parent_id !== undefined) {
      let ancestor = data.parent_id;
      const visited = new Set<number>();
      while (ancestor !== null) {
        if (ancestor === id) return false;
        if (visited.has(ancestor)) return false;
        visited.add(ancestor);
        const row = db.prepare('SELECT parent_id FROM menu_items WHERE id = ?').get(ancestor) as { parent_id: number | null } | undefined;
        if (!row) return false;
        ancestor = row.parent_id;
      }
    }
    const current = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuItem | undefined;
    if (!current) return false;
    return Number(db.prepare('UPDATE menu_items SET label = ?, url = ?, parent_id = ?, position = ?, visible = ? WHERE id = ?').run(data.label ?? current.label, data.url ?? current.url, data.parent_id === undefined ? current.parent_id : data.parent_id, data.position ?? current.position, data.visible === undefined ? current.visible : Number(data.visible), id).changes) > 0;
  },
  deleteMenuItem(id: number): boolean {
    const result = db.prepare('WITH RECURSIVE branch(id) AS (SELECT id FROM menu_items WHERE id = ? UNION SELECT child.id FROM menu_items child JOIN branch parent ON child.parent_id = parent.id) DELETE FROM menu_items WHERE id IN (SELECT id FROM branch)').run(id);
    return Number(result.changes) > 0;
  },

  // Users and permission roles
  getUserByUsername(username: string): (User & { password_hash: string }) | undefined { return db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username) as any; },
  getUserById(id: number): User | undefined { return db.prepare('SELECT id, username, display_name, active, created_at FROM users WHERE id = ?').get(id) as unknown as User | undefined; },
  getUsers(): User[] { return (db.prepare('SELECT id, username, display_name, active, created_at FROM users ORDER BY username').all() as User[]).map((user) => ({ ...user, roles: (db.prepare('SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?').all(user.id) as { name: string }[]).map((role) => role.name) })); },
  createUser(username: string, displayName: string, passwordHash: string, roleIds: number[]): number {
    const result = db.prepare('INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)').run(username, displayName, passwordHash);
    const userId = Number(result.lastInsertRowid);
    const assign = db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)');
    roleIds.forEach((roleId) => assign.run(userId, roleId));
    return userId;
  },
  updateUserRoles(id: number, roleIds: number[]): boolean {
    if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(id)) return false;
    const currentIsSuperAdmin = Boolean(db.prepare('SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? AND r.name = ?').get(id, SUPER_ADMIN_ROLE));
    const keepsSuperAdmin = roleIds.some((roleId) => Boolean(db.prepare('SELECT 1 FROM roles WHERE id = ? AND name = ?').get(roleId, SUPER_ADMIN_ROLE)));
    const superAdminCount = (db.prepare('SELECT COUNT(DISTINCT ur.user_id) count FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE r.name = ?').get(SUPER_ADMIN_ROLE) as { count: number }).count;
    if (currentIsSuperAdmin && !keepsSuperAdmin && superAdminCount <= 1) return false;
    db.prepare('DELETE FROM user_roles WHERE user_id = ?').run(id);
    const assign = db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)');
    roleIds.forEach((roleId) => assign.run(id, roleId));
    return true;
  },
  deleteUser(id: number): boolean {
    const superAdminCount = (db.prepare('SELECT COUNT(DISTINCT ur.user_id) count FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE r.name = ?').get(SUPER_ADMIN_ROLE) as { count: number }).count;
    const isSuperAdmin = Boolean(db.prepare('SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? AND r.name = ?').get(id, SUPER_ADMIN_ROLE));
    if (isSuperAdmin && superAdminCount <= 1) return false;
    return Number(db.prepare('DELETE FROM users WHERE id = ?').run(id).changes) > 0;
  },
  getRoles(): Role[] { return (db.prepare('SELECT * FROM roles ORDER BY name').all() as Role[]).map((role) => ({ ...role, permissions: (db.prepare('SELECT p.name FROM permissions p JOIN role_permissions rp ON rp.permission_id = p.id WHERE rp.role_id = ? ORDER BY p.name').all(role.id) as { name: string }[]).map((item) => item.name) })); },
  getPermissions(): string[] { return (db.prepare('SELECT name FROM permissions ORDER BY name').all() as { name: string }[]).map((item) => item.name); },
  createRole(name: string, label: string, permissions: string[]): number {
    const result = db.prepare('INSERT INTO roles (name, label) VALUES (?, ?)').run(name, label);
    const roleId = Number(result.lastInsertRowid);
    const assign = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name = ?');
    permissions.forEach((permission) => assign.run(roleId, permission));
    return roleId;
  },
  updateRolePermissions(id: number, permissions: string[]): boolean {
    const role = db.prepare('SELECT name FROM roles WHERE id = ?').get(id) as { name: string } | undefined;
    if (!role) return false;
    if (role.name === SUPER_ADMIN_ROLE && !ALL_PERMISSIONS.every((permission) => permissions.includes(permission))) return false;
    db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(id);
    const assign = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name = ?');
    permissions.forEach((permission) => assign.run(id, permission));
    return true;
  },
  userHasPermission(userId: number, permission: string): boolean { return Boolean(db.prepare('SELECT 1 FROM user_roles ur JOIN role_permissions rp ON rp.role_id = ur.role_id JOIN permissions p ON p.id = rp.permission_id WHERE ur.user_id = ? AND p.name = ? LIMIT 1').get(userId, permission)); },

  // Static pages
  getPages(status: 'published' | 'draft' | 'all' = 'published'): Page[] {
    const query = status === 'all'
      ? 'SELECT * FROM pages ORDER BY updated_at DESC'
      : 'SELECT * FROM pages WHERE status = ? ORDER BY updated_at DESC';
    return (status === 'all' ? db.prepare(query).all() : db.prepare(query).all(status)) as unknown as Page[];
  },

  getPageById(id: number): Page | undefined {
    return db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as unknown as Page | undefined;
  },

  getPageBySlug(slug: string): Page | undefined {
    return db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug) as unknown as Page | undefined;
  },

  createPage(data: { title: string; slug: string; excerpt?: string; content?: string; status?: 'published' | 'draft'; show_in_nav?: boolean }): number {
    const result = db.prepare(`
      INSERT INTO pages (title, slug, excerpt, content, status, show_in_nav, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(data.title, data.slug, data.excerpt || '', data.content || '', data.status || 'draft', data.show_in_nav ? 1 : 0);
    return Number(result.lastInsertRowid);
  },

  updatePage(id: number, data: Partial<Page>): boolean {
    const fields: string[] = [];
    const params: any[] = [];
    for (const field of ['title', 'slug', 'excerpt', 'content', 'status', 'show_in_nav']) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push((data as any)[field]);
      }
    }
    if (!fields.length) return false;
    fields.push("updated_at = datetime('now')");
    params.push(id);
    const result = db.prepare(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return Number(result.changes) > 0;
  },

  deletePage(id: number): boolean {
    const result = db.prepare('DELETE FROM pages WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  },

  getMediaMetadata(): MediaMetadata[] {
    return db.prepare('SELECT * FROM media ORDER BY created_at DESC').all() as unknown as MediaMetadata[];
  },

  getMediaFolders(): string[] {
    return (db.prepare('SELECT name FROM media_folders ORDER BY name ASC').all() as { name: string }[]).map((item) => item.name);
  },

  createMediaFolder(name: string): boolean {
    const result = db.prepare('INSERT OR IGNORE INTO media_folders (name) VALUES (?)').run(name);
    return Number(result.changes) > 0;
  },

  deleteMediaFolder(name: string): boolean {
    const result = db.prepare('DELETE FROM media_folders WHERE name = ?').run(name);
    return Number(result.changes) > 0;
  },

  upsertMediaMetadata(filename: string, folder: string = '', originalName: string = filename): void {
    db.prepare('INSERT OR REPLACE INTO media (filename, folder, original_name, created_at) VALUES (?, ?, ?, COALESCE((SELECT created_at FROM media WHERE filename = ?), datetime(\'now\')))').run(filename, folder, originalName, filename);
  },

  moveMediaMetadata(filename: string, folder: string): boolean {
    const result = db.prepare('UPDATE media SET folder = ? WHERE filename = ?').run(folder, filename);
    return Number(result.changes) > 0;
  },

  deleteMediaMetadata(filename: string): void {
    db.prepare('DELETE FROM media WHERE filename = ?').run(filename);
  },

  getMediaReferences(url: string): { type: 'post' | 'page'; id: number; title: string }[] {
    const term = `%${url}%`;
    const posts = db.prepare('SELECT id, title FROM posts WHERE cover_image = ? OR content LIKE ?').all(url, term) as any[];
    const pages = db.prepare('SELECT id, title FROM pages WHERE content LIKE ?').all(term) as any[];
    return [...posts.map((item) => ({ ...item, type: 'post' as const })), ...pages.map((item) => ({ ...item, type: 'page' as const }))];
  },

  // Settings
  getSettings(): Settings {
    const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
    const settings: any = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings as Settings;
  },

  updateSetting(key: string, value: string): void {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  },

  updateSettings(data: Record<string, string>): void {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(data)) {
      stmt.run(key, value);
    }
  },

  // Statistics for Admin Dashboard
  getStats() {
    const totalPosts = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as any)?.count || 0;
    const publishedPosts = (db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").get() as any)?.count || 0;
    const draftPosts = (db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").get() as any)?.count || 0;
    const totalViews = (db.prepare('SELECT SUM(views) as total FROM posts').get() as any)?.total || 0;
    const totalCategories = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as any)?.count || 0;
    const totalPages = (db.prepare('SELECT COUNT(*) as count FROM pages').get() as any)?.count || 0;

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalCategories,
      totalPages,
    };
  },

  // Sessions
  createSession(token: string, userId: string, expiresAt: number): void {
    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  },

  getSession(token: string): { token: string; user_id: string; expires_at: number } | undefined {
    const now = Date.now();
    return db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?').get(token, now) as any;
  },

  deleteSession(token: string): void {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  },

  cleanExpiredSessions(): void {
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  }
};
