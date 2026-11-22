import crypto from 'node:crypto';
import { sql, type Kysely } from 'kysely';
import {
  ALL_PERMISSIONS,
  CONTENT_STATUS,
  DEFAULT_ADMIN_USERNAME,
  SUPER_ADMIN_ROLE,
} from '../shared/constant.ts';
import type { Database } from './schema.ts';

const MENU_MIGRATION_KEY = 'menu_migration_version';
const MENU_MIGRATION_VERSION = '4';
const HOME_MENU_LABEL = 'Trang chủ';
const CATEGORY_MENU_LABEL = 'Chuyên mục';
const ABOUT_MENU_LABEL = 'Giới thiệu';
const ROOT_PATH = '/';
const ABOUT_PATH = '/about';
const CATEGORY_URL_PREFIX = '/category/';
const SUPER_ADMIN_LABEL = 'Quản trị toàn quyền';
const DEFAULT_ADMIN_PASSWORD_SEED = 'admin123';
const SCRYPT_KEY_LEN = 64;
const SALT_BYTES = 16;

function hashSeedPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LEN).toString('hex');
  return `${salt}:${hash}`;
}

async function seedInitialContent(db: Kysely<Database>): Promise<void> {
  const countRow = await db
    .selectFrom('posts')
    .select(sql<number>`COUNT(*)`.as('count'))
    .executeTakeFirst();

  if (Number(countRow?.count || 0) > 0) return;

  const initialCategories = [
    {
      name: 'Lập trình Web',
      slug: 'lap-trinh-web',
      description: 'Các bài viết về công nghệ front-end, back-end và kiến trúc web hiện đại.',
    },
    {
      name: 'Astro Framework',
      slug: 'astro-framework',
      description: 'Khám phá Astro - framework tối ưu hóa hiệu năng với Island Architecture.',
    },
    {
      name: 'Kiến trúc hệ thống',
      slug: 'kien-truc-he-thong',
      description: 'Thiết kế hệ thống, microservices, database và các giải pháp scalable.',
    },
    {
      name: 'Trí tuệ nhân tạo',
      slug: 'tri-tue-nhan-tao',
      description: 'Ứng dụng AI, LLM và các công cụ lập trình thông minh trong thực tế.',
    },
  ];

  for (const cat of initialCategories) {
    await db
      .insertInto('categories')
      .values(cat)
      .onConflict((oc) => oc.doNothing())
      .execute();
  }

  const initialSettings: [string, string][] = [
    ['site_title', 'Astro TechLog'],
    ['site_subtitle', 'Blog công nghệ, lập trình hiện đại & chia sẻ kiến thức'],
    ['site_description', 'Nền tảng blog công nghệ hiệu năng cao xây dựng bằng Astro 5 & SQLite.'],
    ['author_name', 'Châu Ngọc Long'],
    ['admin_username', DEFAULT_ADMIN_USERNAME],
    ['admin_password_hash', hashSeedPassword(DEFAULT_ADMIN_PASSWORD_SEED)],
    ['posts_per_page', '6'],
  ];

  for (const [key, value] of initialSettings) {
    await db
      .insertInto('settings')
      .values({ key, value })
      .onConflict((oc) => oc.column('key').doUpdateSet({ value }))
      .execute();
  }

  const seedPosts = [
    {
      title: 'Khởi đầu với Astro 5: Framework Đỉnh Cao Cho Website Nội Dung',
      slug: 'khoi-dau-voi-astro-5-framework-dinh-cao',
      excerpt:
        'Tìm hiểu tại sao Astro trở thành lựa chọn hàng đầu cho các website nội dung với kiến trúc Islands Architecture và Zero JS by default.',
      content: `# Khởi đầu với Astro 5: Framework Đỉnh Cao Cho Website Nội Dung

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
      cover_image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      category: 'Astro Framework',
      tags: 'astro, webdev, performance, frontend',
      status: CONTENT_STATUS.PUBLISHED,
      author: 'Châu Ngọc Long',
      views: 152,
      offset: '-2 days',
    },
    {
      title: 'Tối Ưu Hóa Lưu Trữ với SQLite và Node.js Built-in DatabaseSync',
      slug: 'toi-uu-hoa-luu-tru-voi-sqlite-va-nodejs',
      excerpt:
        'Khám phá module node:sqlite mới nhất trong Node.js 22+, giúp bạn xây dựng database nhúng siêu tốc mà không cần cài đặt thêm bất kỳ thư viện C++ native nào.',
      content: `# Tối Ưu Hóa Lưu Trữ với SQLite và Node.js Built-in DatabaseSync

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
      cover_image:
        'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
      category: 'Kiến trúc hệ thống',
      tags: 'sqlite, nodejs, backend, database',
      status: CONTENT_STATUS.PUBLISHED,
      author: 'Châu Ngọc Long',
      views: 88,
      offset: '-1 days',
    },
    {
      title: 'Xây Dựng Tư Duy Thiết Kế Giao Diện UI/UX Cho Lập Trình Viên',
      slug: 'xay-dung-tu-duy-thiet-ke-giao-dien-ui-ux',
      excerpt:
        'Những nguyên tắc cốt lõi về khoảng trắng, typography, độ tương phản và phân cấp thị giác giúp lập trình viên tự tin tạo ra sản phẩm đẹp mắt.',
      content: `# Xây Dựng Tư Duy Thiết Kế Giao Diện UI/UX Cho Lập Trình Viên

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
      cover_image:
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
      category: 'Lập trình Web',
      tags: 'ui, ux, design, tailwindcss',
      status: CONTENT_STATUS.PUBLISHED,
      author: 'Châu Ngọc Long',
      views: 45,
      offset: '-12 hours',
    },
    {
      title: 'Bản nháp: Khám Phá AI Agent và Kỷ Nguyên Tự Động Hóa 2026',
      slug: 'kham-pha-ai-agent-ky-nguyen-tu-dong-hoa',
      excerpt:
        'Tài liệu phác thảo nghiên cứu về các mô hình Agentic AI, Autonomous Workflows và tương lai của kỹ nghệ phần mềm.',
      content: `# Khám Phá AI Agent và Kỷ Nguyên Tự Động Hóa 2026

Bài viết đang trong giai đoạn soạn thảo. Nội dung sẽ bao gồm:
- So sánh Chatbot thông thường vs Autonomous Agent.
- Cơ chế ReAct (Reasoning + Acting) và Function Calling.
- Triển khai Subagents trong bài toán thực tế.`,
      cover_image:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      category: 'Trí tuệ nhân tạo',
      tags: 'ai, agent, automation',
      status: CONTENT_STATUS.DRAFT,
      author: 'Châu Ngọc Long',
      views: 0,
      offset: '-3 hours',
    },
  ];

  for (const post of seedPosts) {
    const { offset, ...fields } = post;
    await db
      .insertInto('posts')
      .values({
        ...fields,
        created_at: sql<string>`datetime('now', ${offset})`,
        updated_at: sql<string>`datetime('now', ${offset})`,
      })
      .execute();
  }
}

async function seedAccessControl(db: Kysely<Database>): Promise<void> {
  const settingRows = await db.selectFrom('settings').select(['key', 'value']).execute();
  const settings = Object.fromEntries(settingRows.map((row) => [row.key, row.value]));
  const username = settings.admin_username || DEFAULT_ADMIN_USERNAME;
  const passwordHash = settings.admin_password_hash;
  if (!passwordHash) return;

  await db
    .insertInto('users')
    .values({
      username,
      display_name: settings.author_name || username,
      password_hash: passwordHash,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto('roles')
    .values({ name: SUPER_ADMIN_ROLE, label: SUPER_ADMIN_LABEL })
    .onConflict((oc) => oc.doNothing())
    .execute();

  const role = await db
    .selectFrom('roles')
    .select('id')
    .where('name', '=', SUPER_ADMIN_ROLE)
    .executeTakeFirst();
  const user = await db
    .selectFrom('users')
    .select('id')
    .where('username', '=', username)
    .executeTakeFirst();

  if (role && user) {
    await db
      .insertInto('user_roles')
      .values({ user_id: user.id, role_id: role.id })
      .onConflict((oc) => oc.doNothing())
      .execute();
  }

  for (const permission of ALL_PERMISSIONS) {
    await db
      .insertInto('permissions')
      .values({ name: permission })
      .onConflict((oc) => oc.doNothing())
      .execute();

    const permissionRow = await db
      .selectFrom('permissions')
      .select('id')
      .where('name', '=', permission)
      .executeTakeFirst();

    if (role && permissionRow) {
      await db
        .insertInto('role_permissions')
        .values({ role_id: role.id, permission_id: permissionRow.id })
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }
}

async function seedCurrentNavigation(db: Kysely<Database>): Promise<void> {
  const migration = await db
    .selectFrom('settings')
    .select('value')
    .where('key', '=', MENU_MIGRATION_KEY)
    .executeTakeFirst();

  if (migration?.value === MENU_MIGRATION_VERSION) return;

  const maxPosRow = await db
    .selectFrom('menu_items')
    .select(sql<number>`COALESCE(MAX(position), -1) + 1`.as('position'))
    .where('parent_id', 'is', null)
    .executeTakeFirst();
  let rootPosition = Number(maxPosRow?.position ?? 0);

  const ensureRoot = async (label: string, url: string): Promise<number> => {
    const existing = await db
      .selectFrom('menu_items')
      .select('id')
      .where('parent_id', 'is', null)
      .where('label', '=', label)
      .where('url', '=', url)
      .executeTakeFirst();
    if (existing) return existing.id;

    const result = await db
      .insertInto('menu_items')
      .values({ label, url, parent_id: null, position: rootPosition++ })
      .executeTakeFirst();
    return Number(result.insertId);
  };

  await ensureRoot(HOME_MENU_LABEL, ROOT_PATH);

  const pages = await db
    .selectFrom('pages')
    .select(['title', 'slug'])
    .where('status', '=', CONTENT_STATUS.PUBLISHED)
    .where('show_in_nav', '=', 1)
    .orderBy('updated_at', 'desc')
    .execute();

  for (const page of pages) {
    await ensureRoot(page.title, `/${page.slug}`);
  }

  const categoryRoot = await ensureRoot(CATEGORY_MENU_LABEL, ROOT_PATH);
  const categories = await db
    .selectFrom('categories')
    .select(['id', 'name', 'slug', 'parent_id'])
    .orderBy(sql`parent_id IS NOT NULL`)
    .orderBy('position', 'asc')
    .orderBy('name', 'asc')
    .execute();

  const categoryMenuIds = new Map<number, number>();
  for (let position = 0; position < categories.length; position += 1) {
    const category = categories[position];
    const parentId = category.parent_id
      ? categoryMenuIds.get(category.parent_id) || categoryRoot
      : categoryRoot;
    const url = `${CATEGORY_URL_PREFIX}${category.slug}`;
    const existing = await db
      .selectFrom('menu_items')
      .select('id')
      .where('url', '=', url)
      .executeTakeFirst();

    let menuId: number;
    if (existing) {
      menuId = existing.id;
      await db
        .updateTable('menu_items')
        .set({ parent_id: parentId, position })
        .where('id', '=', menuId)
        .execute();
    } else {
      const inserted = await db
        .insertInto('menu_items')
        .values({ label: category.name, url, parent_id: parentId, position })
        .executeTakeFirst();
      menuId = Number(inserted.insertId);
    }
    categoryMenuIds.set(category.id, menuId);
  }

  await ensureRoot(ABOUT_MENU_LABEL, ABOUT_PATH);

  await db
    .insertInto('settings')
    .values({ key: MENU_MIGRATION_KEY, value: MENU_MIGRATION_VERSION })
    .onConflict((oc) => oc.column('key').doUpdateSet({ value: MENU_MIGRATION_VERSION }))
    .execute();
}

export async function runSeeders(db: Kysely<Database>): Promise<void> {
  await seedInitialContent(db);
  await seedAccessControl(db);
  await seedCurrentNavigation(db);

  await db
    .updateTable('posts')
    .set({
      created_at: sql<string>`datetime('now')`,
      updated_at: sql<string>`datetime('now')`,
    })
    .where((eb) => eb.or([eb('created_at', 'is', null), eb('created_at', '=', '')]))
    .execute();
}
