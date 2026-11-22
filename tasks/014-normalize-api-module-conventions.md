# 014 — Normalize src/api module conventions (constant.ts, types.ts, shared/, repository/service classification)

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Chuẩn hóa quy ước đặt tên và phân tầng trong `src/api/`:

- Đặt tên mọi file constants là `constant.ts` (không dùng `*.constants.ts` hay `constants.ts`).
- Đặt tên mọi file schema/types là `types.ts` (không dùng `*.schema.ts`).
- Tạo module `src/api/shared/` chứa `constant.ts`, `types.ts`, `auth.middleware.ts`, `index.ts` cho các hằng số, types, middleware dùng chung nhiều module (`HTTP_STATUS`, `API_MESSAGES`, `CONTENT_STATUS`, `PERMISSIONS`, `ApiEnv`, `DbExecutor`, `requireAuth`, `requirePermission`).
- Phân loại rõ các file chưa đúng tầng:
  - `src/api/media/media.storage.ts` → `src/api/media/media-storage.repository.ts` (file storage persistence).
  - `src/api/media/media.folders.ts` → `src/api/media/media-folder.service.ts` (logical folder path validation/domain rules).
  - `src/api/auth/session.ts` → `src/api/auth/auth.service.ts` (cookie/password auth service).
  - `src/api/auth/permissions.ts` → chuyển vào `src/api/shared/constant.ts` & `src/api/shared/types.ts`.
- Xóa `src/api/constants.ts` và `src/api/middleware/`.
- Cập nhật toàn bộ imports trong `src/`, `test/`, và `docs/ARCHITECTURE.md`.

## Acceptance criteria

- [x] Toàn bộ constants file đều tên `constant.ts`; toàn bộ schema/type file đều tên `types.ts`.
- [x] `src/api/shared/` chứa shared constants, types và auth middleware.
- [x] Không còn `.storage.ts`, `.folders.ts`, `session.ts`, `permissions.ts`, `*.schema.ts`, `*.constants.ts` trong `src/api/`.
- [x] `pnpm test` và `pnpm build` pass 100%.

## Dependencies

- Không có dependency mới.

## Security impact

- Giữ nguyên logic xác thực, phân quyền RBAC, và validation media upload/path traversal.

## Assumptions

- Mọi caller trong `src/` và `test/` được cập nhật đầy đủ sang đường dẫn mới.

## Plan

1. Tạo `src/api/shared/` (`constant.ts`, `types.ts`, `auth.middleware.ts`, `index.ts`).
2. Đổi tên/tách `constant.ts`, `types.ts`, `media-storage.repository.ts`, `media-folder.service.ts`, `auth.service.ts` trong các domain folders.
3. Cập nhật `src/api/db/schema.ts`, `src/api/index.ts`, và toàn bộ imports trong `src/` và `test/`.
4. Xóa các file cũ và chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã chuẩn hóa toàn bộ domain modules theo quy ước `constant.ts`, `types.ts`, `*.repository.ts`, `*.service.ts`, `*.handler.ts`, `*.route.ts`, `index.ts`.
- Đã tách module `src/api/shared/` (`constant.ts`, `types.ts`, `auth.middleware.ts`, `index.ts`).
- Đã phân loại rõ: `media-storage.repository.ts` (file storage persistence), `media-folder.service.ts` (logical folder path rules), `auth.service.ts` (cookie/password auth service).

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
