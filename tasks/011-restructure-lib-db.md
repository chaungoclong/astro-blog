# 011 — Restructure src/lib and src/db directories

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Tái cấu trúc `src/lib/` và `src/db/` cho đúng trách nhiệm:

- Xóa `src/lib/db.ts` (facade cũ không còn cần thiết; components import types trực tiếp từ `src/db/schema.ts`).
- `src/db/`: tách `connection.ts` khỏi `index.ts`; `index.ts` làm barrel export cho `db`, `rawDb`, `createSqliteConnection` và schema types.
- `src/auth/`: chuyển `auth.ts` → `session.ts` và `permissions.ts` từ `src/lib/` sang `src/auth/` + `index.ts`.
- `src/storage/`: chuyển `media.ts` và `media-folders.ts` → `folders.ts` từ `src/lib/` sang `src/storage/` + `index.ts`.
- `src/lib/`: chỉ giữ pure stateless utilities (`seo.ts`, `utils.ts`).
- Cập nhật toàn bộ imports trong `src/` và `test/`, cập nhật `docs/ARCHITECTURE.md`.

## Acceptance criteria

- [x] `src/lib/db.ts` đã được xóa; `src/lib/` chỉ còn `seo.ts` và `utils.ts`.
- [x] `src/auth/` chứa `session.ts`, `permissions.ts`, `index.ts`.
- [x] `src/storage/` chứa `media.ts`, `folders.ts`, `index.ts`.
- [x] `src/db/` tách `connection.ts` và `index.ts` barrel export.
- [x] `pnpm test` và `pnpm build` pass 100%.

## Dependencies

- Không có dependency mới.

## Security impact

- Không thay đổi logic xác thực, phân quyền hay upload validation; chỉ di chuyển module và cập nhật import paths.

## Assumptions

- Mọi caller trong `src/` và `test/` được cập nhật đầy đủ import path mới.

## Plan

1. Di chuyển `auth.ts`, `permissions.ts` sang `src/auth/` và `media.ts`, `media-folders.ts` sang `src/storage/`.
2. Xóa `src/lib/db.ts` và tách `src/db/connection.ts` + `src/db/index.ts`.
3. Cập nhật imports trong `src/` và `test/`, cập nhật `docs/ARCHITECTURE.md`.
4. Chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã xóa `src/lib/db.ts`, tách `src/auth/` (`session.ts`, `permissions.ts`, `index.ts`) và `src/storage/` (`media.ts`, `folders.ts`, `index.ts`), giữ `src/lib/` chỉ còn `seo.ts` và `utils.ts`.
- Đã tách `src/db/connection.ts` và giữ `src/db/index.ts` làm barrel export cho connection + schema types.

## Self-review

- [x] Scope và backward compatibility
- [x] Không còn magic value trong source code, test, script, migration hay conversion; giá trị nghiệp vụ/config dùng hằng số có tên
- [x] Secrets và dữ liệu nhạy cảm
- [x] Path traversal / input validation
- [x] Approval behavior
- [x] Persistence / migration

## Test plan

- [x] Build (`pnpm build`)
- [x] Existing test suite (`pnpm test`)

## Test report

| Check        | Status | Evidence / reason                          |
| ------------ | ------ | ------------------------------------------ |
| `pnpm test`  | PASS   | 42/42 tests passed                         |
| `pnpm build` | PASS   | Astro 5 SSR server & client build hoàn tất |

## Blockers

- None
