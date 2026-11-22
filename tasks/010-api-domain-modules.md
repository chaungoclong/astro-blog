# 010 — Organize Hono API into domain modules (route, handler, constants)

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Tổ chức lại `src/api/` theo cấu trúc domain-driven tại `src/api/domains/<domain>/`, mỗi domain gồm:

- `<domain>.constants.ts`: Hằng số thông báo, validation và cấu hình riêng của domain.
- `<domain>.handler.ts`: Request/response handlers (nhận Hono `Context`, parse input, gọi `services/`, trả JSON/redirect).
- `<domain>.route.ts`: Định nghĩa Hono router, gắn middleware (`requireAuth`, `requirePermission`) và map đường dẫn sang handler.
- `index.ts`: Barrel export của domain.

Domains: `auth`, `posts`, `categories`, `pages`, `media`, `menus`, `users`, `roles`, `settings`.
Xóa `src/api/routes/` cũ và cập nhật `src/api/app.ts`, `docs/ARCHITECTURE.md`, `test/retro-ui.test.js`, `test/media-folder-api.test.js`.

## Acceptance criteria

- [x] Mỗi domain API nằm trong `src/api/domains/<domain>/` với `<domain>.route.ts`, `<domain>.handler.ts`, `<domain>.constants.ts`, `index.ts`.
- [x] `src/api/app.ts` chỉ mount các domain routes từ `src/api/domains/*`.
- [x] Không còn thư mục `src/api/routes/`.
- [x] Không có magic value.
- [x] `pnpm test` và `pnpm build` pass 100%.

## Dependencies

- `hono`

## Security impact

- Giữ nguyên toàn bộ auth/RBAC middleware (`requireAuth`, `requirePermission`) trên từng domain route.

## Assumptions

- Hành vi HTTP (status code, payload, cookie) giữ nguyên 100%.

## Plan

1. Tạo 9 domain modules trong `src/api/domains/`.
2. Cập nhật `src/api/app.ts` và xóa `src/api/routes/`.
3. Cập nhật `test/retro-ui.test.js`, `test/media-folder-api.test.js`, và `docs/ARCHITECTURE.md`.
4. Chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã tổ chức lại toàn bộ API thành 9 domain modules trực tiếp dưới `src/api/` (`auth`, `posts`, `categories`, `pages`, `media`, `menus`, `users`, `roles`, `settings`), mỗi domain có `<domain>.constants.ts`, `<domain>.handler.ts`, `<domain>.route.ts`, `index.ts`.
- Đã xóa `src/api/routes/` và cập nhật `src/api/app.ts`, `docs/ARCHITECTURE.md`, `test/retro-ui.test.js`, `test/media-folder-api.test.js`.

## Self-review

- [x] Scope và backward compatibility
- [x] Không còn magic value trong source code, test, script, migration hay conversion; giá trị nghiệp vụ/config dùng hằng số có tên
- [x] Secrets và dữ liệu nhạy cảm
- [x] Path traversal / input validation
- [x] Approval behavior
- [x] Persistence / migration

## Test plan

- [x] Build (`pnpm build`)
- [x] Existing & Hono API test suite (`pnpm test`)

## Test report

| Check        | Status | Evidence / reason                          |
| ------------ | ------ | ------------------------------------------ |
| `pnpm test`  | PASS   | 42/42 tests passed                         |
| `pnpm build` | PASS   | Astro 5 SSR server & client build hoàn tất |

## Blockers

- None
