# 013 — Move all backend modules (auth, storage, db, domain schemas) into src/api

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Đưa toàn bộ phần logic backend vào `src/api/`:

- `src/auth/` → `src/api/auth/` (`session.ts`, `permissions.ts`).
- `src/storage/` → `src/api/media/` (`media.storage.ts`, `media.folders.ts`).
- `src/db/` → `src/api/db/` (`connection.ts`, `dialect.ts`, `migrate.ts`, `seed.ts`, `schema.ts`, `index.ts`).
- Tách `schema.ts` thành `<domain>/*.schema.ts` trong từng domain (`posts`, `categories`, `pages`, `media`, `menus`, `users`, `roles`, `settings`, `auth`, `stats`), và `src/api/db/schema.ts` tổng hợp `Database` interface từ các domain schema.
- Cập nhật `package.json` (`db:migrate`, `db:migrate:schema`, `test`), `docs/ARCHITECTURE.md`, toàn bộ imports trong `src/` và `test/`.

## Acceptance criteria

- [x] Không còn `src/auth/`, `src/storage/`, `src/db/` ở root `src/`.
- [x] Mỗi domain trong `src/api/<domain>/` sở hữu `<entity>.schema.ts` riêng.
- [x] `src/api/db/schema.ts` tổng hợp `Database` interface từ các domain schema.
- [x] `pnpm test` và `pnpm build` pass 100%.

## Dependencies

- Không có dependency mới.

## Security impact

- Không thay đổi logic xác thực, phân quyền hay upload validation; chỉ di chuyển module vào `src/api/`.

## Assumptions

- `src/lib/` chỉ giữ `seo.ts` và `utils.ts` (shared/presentation helpers).

## Plan

1. Di chuyển `src/auth/*` vào `src/api/auth/`, `src/storage/*` vào `src/api/media/`, `src/db/*` vào `src/api/db/`.
2. Tách schema từng domain thành `*.schema.ts` và cập nhật `src/api/db/schema.ts`.
3. Cập nhật barrel `index.ts`, `package.json`, toàn bộ imports trong `src/` và `test/`, và `docs/ARCHITECTURE.md`.
4. Chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã chuyển toàn bộ `src/auth/`, `src/storage/`, `src/db/` vào `src/api/`.
- Đã tách schema từng domain thành `*.schema.ts` và tổng hợp lại tại [schema.ts](file:///home/long/Dev/astro-cms-test/src/api/db/schema.ts).
- Đã sửa lỗi double-prefix `/api/api/` phát sinh trong quá trình rewrite regex trước khi chạy build & test.

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
