# 009 — Extract API layer to Hono.js

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Tách toàn bộ API endpoints từ Astro file-based routes (`src/pages/api/**`) sang ứng dụng **Hono.js** độc lập tại `src/api/`, mount vào Astro qua catch-all route `src/pages/api/[...path].ts`:

- `src/api/constants.ts`: Hằng số HTTP status, thông báo lỗi, và reserved slugs.
- `src/api/middleware/auth.ts`: Hono middleware `requireAuth` và `requirePermission` dùng `hono/cookie` + `sessionService` + `userService`.
- `src/api/routes/`: `auth.ts`, `posts.ts`, `categories.ts`, `pages.ts`, `media.ts`, `menus.ts`, `users.ts`, `roles.ts`, `settings.ts`.
- `src/api/app.ts`: Hono app chính (`basePath('/api')`), mount các route modules và error/notFound handlers.
- `src/pages/api/[...path].ts`: Catch-all `ALL` handler forward `request` sang `apiApp.fetch(request)`.
- Xóa các file endpoint cũ trong `src/pages/api/**`.
- Cập nhật `docs/ARCHITECTURE.md` và tests (`test/hono-api.test.js`, `test/retro-ui.test.js`, `test/media-folder-api.test.js`).

## Acceptance criteria

- [x] Toàn bộ endpoints `/api/*` được xử lý bởi Hono app tại `src/api/app.ts`.
- [x] Astro catch-all `src/pages/api/[...path].ts` chuyển tiếp mọi HTTP method sang `apiApp.fetch(request)`.
- [x] Authentication (`astro_blog_session` cookie) và RBAC (`requirePermission`) hoạt động ngay bên trong Hono middleware.
- [x] Tách migration & seeding (`src/db/migrate.ts`, `pnpm db:migrate`) ra khỏi `src/db/index.ts` để an toàn cho serverless cold start.
- [x] Không có magic value trong code mới.
- [x] `pnpm test` và `pnpm build` pass 100%, bổ sung test HTTP trực tiếp qua `apiApp.request(...)`.

## Dependencies

- `hono`

## Security impact

- Hono middleware tự kiểm tra session cookie và capability permissions trên mọi protected route, đảm bảo an toàn cả khi chạy trong Astro SSR lẫn khi chạy standalone.

## Assumptions

- `Astro.request` truyền vào `apiApp.fetch(request)` giữ nguyên headers (bao gồm `Cookie`), method, URL và body.

## Plan

1. Tạo `src/api/constants.ts` và `src/api/middleware/auth.ts`.
2. Tạo 9 route modules trong `src/api/routes/`.
3. Tạo `src/api/app.ts` và `src/pages/api/[...path].ts`, xóa các file endpoint cũ trong `src/pages/api/**`.
4. Thêm `test/hono-api.test.js` và cập nhật đường dẫn trong `test/retro-ui.test.js`, `test/media-folder-api.test.js`.
5. Cập nhật `docs/ARCHITECTURE.md` và chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã tách toàn bộ API sang Hono.js tại `src/api/` và mount qua `src/pages/api/[...path].ts`.
- Đã tách migration & seeding sang `src/db/migrate.ts` (`pnpm db:migrate`), loại bỏ hoàn toàn DDL/seeding khi import `src/db/index.ts`.

## Self-review

- [x] Scope và backward compatibility
- [x] Không còn magic value trong source code, test, script, migration hay conversion; giá trị nghiệp vụ/config dùng hằng số có tên
- [x] Secrets và dữ liệu nhạy cảm
- [x] Path traversal / input validation
- [x] Approval behavior
- [x] Persistence / migration

## Test plan

- [x] Unit / HTTP integration (`apiApp.request`)
- [x] Build (`pnpm build`)
- [x] Existing test suite (`pnpm test`)

## Test report

| Check        | Status | Evidence / reason                                                    |
| ------------ | ------ | -------------------------------------------------------------------- |
| `pnpm test`  | PASS   | 42/42 tests passed (`test/hono-api.test.js` + toàn bộ suite hiện có) |
| `pnpm build` | PASS   | Astro 5 SSR server & client build hoàn tất                           |

## Blockers

- None
