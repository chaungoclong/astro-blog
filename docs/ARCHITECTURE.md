# Kiến trúc dự án

## Stack

- Astro 5 SSR với Node adapter.
- Tailwind CSS v4; CSS toàn cục ở `src/styles/global.css`.
- Node 22 `DatabaseSync`/SQLite tại `data/blog.db`, truy cập qua Kysely query builder với custom `NodeSqliteDialect`.
- Markdown render bằng `marked`.

## Cấu trúc

| Đường dẫn           | Vai trò                                                                                                                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/`          | Toàn bộ backend: Hono.js domain modules tại `modules/<domain>/` (`<entity>.{route,handler,service,repository}.ts`, `constant.ts`, `types.ts`, `index.ts`), `shared/` (`constant.ts`, `types.ts`, `middleware/auth.middleware.ts`, `index.ts`), `db/` (Kysely `NodeSqliteDialect`, `connection.ts`, `schema.ts`, `migrate.ts`, `seed.ts`), `app.ts`, `index.ts`. |
| `src/pages/`        | Route public, admin và catch-all `api/[...path].ts` chuyển tiếp sang Hono.                                                                                                                                                                                                                                                                                      |
| `src/layouts/`      | `BaseLayout` public; `AdminLayout` back-office.                                                                                                                                                                                                                                                                                                                 |
| `src/components/`   | UI tái sử dụng.                                                                                                                                                                                                                                                                                                                                                 |
| `src/lib/`          | Tiện ích thuần túy dùng chung (`seo.ts`, `utils.ts`).                                                                                                                                                                                                                                                                                                           |
| `src/middleware.ts` | Bảo vệ admin chưa đăng nhập và phân quyền theo capability.                                                                                                                                                                                                                                                                                                      |

## Routing

- Public: `/`, `/blog/[slug]`, `/category/[slug]`, `/search`, `/about`, `/[slug]` (managed Pages).
- Admin: `/admin`, `/admin/posts/*`, `/admin/categories`, `/admin/pages/*`, `/admin/settings`.
- API: `/api/posts/*`, `/api/categories/*`, `/api/pages/*`, `/api/settings`, `/api/auth/*`.

`/[slug]` là fallback cho Pages. Slug page không được trùng `admin`, `api`, `blog`, `category`, `search`, `about`, `robots.txt`, `sitemap.xml`.

## Dữ liệu và bảo mật

Các bảng: `posts`, `categories`, `pages`, `media`, `media_folders`, `settings`, `sessions`, `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `menu_items`. Chỉ các `*.repository.ts` trong `src/api/modules/<domain>/` truy cập SQLite thông qua Kysely (`db`), và routes/pages gọi tầng `*.service.ts`.

- API thay đổi dữ liệu yêu cầu session hợp lệ.
- Draft không render cho khách.
- Password hash bằng scrypt; session cookie HttpOnly.
- Nội dung public không tiết lộ điều hướng/admin controls.

Khi thêm loại nội dung: tạo bảng + type + methods ở `db.ts`, endpoint xác thực, UI admin, public renderer với phân quyền draft, sitemap nếu published và tests.

## Media storage

Media routes và admin UI phụ thuộc vào MediaStorage contract, không phụ thuộc trực tiếp vào filesystem. Local provider là mặc định trong development; provider S3/R2 có thể được chọn theo cấu hình deployment và phải giữ cùng các thao tác upload, list, read, delete, public URL. Upload dùng allowlist và signature: ảnh tối đa 5 MiB; PDF, ZIP và tài liệu Office tối đa 20 MiB. File không phải ảnh được phục vụ với `Content-Disposition: attachment` và `nosniff` để tránh active content chạy cùng origin.

SQLite lưu logical folders phân cấp dưới dạng path gồm các segment đã validation và quan hệ tổ chức media, còn storage provider chỉ sở hữu bytes. Parent phải tồn tại trước khi tạo subfolder; path không chấp nhận segment traversal. Vì vậy việc tạo/move folder không thay đổi public URL và không phụ thuộc Local, S3 hay R2. Trước khi xóa ảnh hoặc xóa recursive một folder, API dò tham chiếu trong cover/content của Posts và content của Pages; folder delete có bước preview và yêu cầu force confirmation nếu bất kỳ ảnh con nào đang được dùng.

## Taxonomy, menu và authorization

Categories là adjacency tree qua `parent_id` và `position`; service từ chối self-parent và ancestor cycle. `menu_items` dùng cùng mô hình cây, tách khỏi Pages/Categories để menu có thể chứa URL nội bộ hoặc HTTPS bên ngoài và được sắp xếp độc lập. Menu service từ chối parent không tồn tại, self/ancestor cycle và cyclic ancestor chain đã hỏng; xóa dùng recursive branch delete rõ ràng. Home/About là source hệ thống có thể thêm lại, không phải records bất biến trong menu.

Authorization dùng `users`, `roles`, `permissions`, `user_roles`, `role_permissions`. Permission là capability được kiểm tra tại middleware/API; role chỉ là nhóm permission gán cho user, theo mô hình Laravel Permission. Tài khoản admin cũ được migrate idempotent sang user có role `super-admin`; không cho xóa hoặc gỡ quyền super-admin cuối cùng. UI ẩn/hiện chỉ hỗ trợ trải nghiệm, middleware và endpoint mới là security boundary.
