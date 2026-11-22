# 012 — Colocate repositories and services inside src/api domain folders

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Di chuyển toàn bộ files trong `src/repositories/` và `src/services/` vào đúng thư mục domain tương ứng trong `src/api/`:

- `src/api/posts/`: `post.repository.ts`, `post.service.ts`
- `src/api/categories/`: `category.repository.ts`, `category.service.ts`
- `src/api/pages/`: `page.repository.ts`, `page.service.ts`
- `src/api/media/`: `media.repository.ts`, `media.service.ts`
- `src/api/menus/`: `menu.repository.ts`, `menu.service.ts`
- `src/api/users/`: `user.repository.ts`, `user.service.ts`
- `src/api/roles/`: `role.repository.ts`, `role.service.ts`
- `src/api/settings/`: `setting.repository.ts`, `setting.service.ts`
- `src/api/auth/`: `session.repository.ts`, `session.service.ts`
- `src/api/stats/`: `stats.service.ts`, `index.ts`
- `src/api/index.ts`: Barrel export toàn bộ services, repositories và `apiApp`.
- Xóa `src/repositories/` và `src/services/`.
- Cập nhật toàn bộ imports trong `src/` và `test/`, cập nhật `docs/ARCHITECTURE.md`.

## Acceptance criteria

- [x] Mỗi domain trong `src/api/<domain>/` chứa đầy đủ route, handler, constants, service, repository và `index.ts`.
- [x] Không còn thư mục `src/repositories/` và `src/services/`.
- [x] `pnpm test` và `pnpm build` pass 100%.

## Dependencies

- Không có dependency mới.

## Security impact

- Không thay đổi logic bảo mật hay query; chỉ tái tổ chức vị trí module theo domain.

## Assumptions

- Mọi caller trong `src/` và `test/` import từ `src/api/<domain>/` hoặc barrel `src/api/index.ts`.

## Plan

1. Tạo `src/api/stats/` và di chuyển từng repository/service vào `src/api/<domain>/`.
2. Cập nhật relative imports bên trong các file vừa di chuyển và cập nhật `index.ts` của từng domain + `src/api/index.ts`.
3. Xóa `src/repositories/` và `src/services/`.
4. Cập nhật imports trong `src/api/`, `src/auth/`, `src/middleware.ts`, `src/layouts/`, `src/components/`, `src/pages/`, `test/` và `docs/ARCHITECTURE.md`.
5. Chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã di chuyển toàn bộ `*.repository.ts` và `*.service.ts` vào các thư mục domain tương ứng trong `src/api/` (`auth`, `posts`, `categories`, `pages`, `media`, `menus`, `users`, `roles`, `settings`, `stats`).
- Đã thêm barrel [src/api/index.ts](file:///home/long/Dev/astro-cms-test/src/api/index.ts) và xóa `src/repositories/`, `src/services/`.

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
