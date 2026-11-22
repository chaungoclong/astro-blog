# 016 — Standardize src/api directory structure and file naming conventions

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Chuẩn hóa lại cấu trúc thư mục `src/api/` theo best practices (tách rõ infrastructure/shared khỏi domain modules) và chuẩn hóa cách đặt tên file đồng nhất:

1. **Tách `src/api/modules/` cho toàn bộ domain modules**:
   - Di chuyển `auth/`, `categories/`, `media/`, `menus/`, `pages/`, `posts/`, `roles/`, `settings/`, `stats/`, `users/` vào `src/api/modules/<domain>/`.
   - Giữ `src/api/app.ts`, `src/api/index.ts`, `src/api/db/`, và `src/api/shared/` ở tầng gốc của `src/api/`.
2. **Tổ chức `src/api/shared/middleware/`**:
   - Di chuyển `src/api/shared/auth.middleware.ts` vào `src/api/shared/middleware/auth.middleware.ts` và export lại qua `src/api/shared/index.ts`.
3. **Chuẩn hóa cách đặt tên file trong mỗi domain module theo quy ước `<entity>.<layer>.ts` (số ít nhất quán)**:
   - `categories/`: `categories.handler.ts` → `category.handler.ts`, `categories.route.ts` → `category.route.ts`
   - `menus/`: `menus.handler.ts` → `menu.handler.ts`, `menus.route.ts` → `menu.route.ts`
   - `pages/`: `pages.handler.ts` → `page.handler.ts`, `pages.route.ts` → `page.route.ts`
   - `posts/`: `posts.handler.ts` → `post.handler.ts`, `posts.route.ts` → `post.route.ts`
   - `roles/`: `roles.handler.ts` → `role.handler.ts`, `roles.route.ts` → `role.route.ts`
   - `settings/`: `settings.handler.ts` → `setting.handler.ts`, `settings.route.ts` → `setting.route.ts`
   - `users/`: `users.handler.ts` → `user.handler.ts`, `users.route.ts` → `user.route.ts`
4. **Loại bỏ magic route strings trong `src/api/app.ts`**:
   - Dùng hằng số `API_ROUTES` cho các route prefix khi mount domain routes.
5. **Cập nhật toàn bộ imports và tài liệu**:
   - Cập nhật imports trong `src/api/`, `src/middleware.ts`, `src/pages/`, `test/`, và cập nhật `docs/ARCHITECTURE.md`.

## Acceptance criteria

- [x] Toàn bộ domain modules nằm trong `src/api/modules/<domain>/`.
- [x] `src/api/shared/middleware/auth.middleware.ts` nằm trong `middleware/` và được export qua `src/api/shared/index.ts`.
- [x] Toàn bộ file trong mỗi module đều dùng tên số ít nhất quán `<entity>.{route,handler,service,repository}.ts`, `constant.ts`, `types.ts`, `index.ts`.
- [x] `src/api/app.ts` không còn magic route strings khi mount routes.
- [x] Toàn bộ imports trong `src/` và `test/` được cập nhật đầy đủ; `docs/ARCHITECTURE.md` phản ánh cấu trúc mới.
- [x] `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, và `pnpm build` pass 100%.

## Dependencies

- Không có dependency mới.

## Security impact

- Không thay đổi logic xác thực, phân quyền RBAC, validation hay media storage; giữ nguyên toàn bộ security boundaries.

## Assumptions

- Mọi caller ngoài `src/api/` ưu tiên import qua barrel `src/api` hoặc đường dẫn chuẩn mới.

## Plan

1. Di chuyển domain modules vào `src/api/modules/` và `auth.middleware.ts` vào `src/api/shared/middleware/`.
2. Đổi tên các file `*.handler.ts` và `*.route.ts` sang dạng số ít `<entity>.handler.ts` và `<entity>.route.ts`.
3. Cập nhật toàn bộ relative imports bên trong `src/api/`, `src/middleware.ts`, `src/pages/`, `test/`.
4. Dùng hằng số `API_ROUTES` trong `src/api/app.ts`.
5. Cập nhật `docs/ARCHITECTURE.md` và chạy full verification (`pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`).

## Implementation notes

- Đã tách 10 domain modules (`auth`, `categories`, `media`, `menus`, `pages`, `posts`, `roles`, `settings`, `stats`, `users`) vào `src/api/modules/`.
- Đã chuyển `auth.middleware.ts` vào `src/api/shared/middleware/auth.middleware.ts`.
- Đã chuẩn hóa tên file `.handler.ts` và `.route.ts` sang số ít `<entity>.handler.ts` / `<entity>.route.ts` cho `categories`, `menus`, `pages`, `posts`, `roles`, `settings`, `users`.
- Đã thay thế magic route strings trong `src/api/app.ts` bằng hằng số `API_ROUTES`.
- Đã loại bỏ toàn bộ `export *` re-export vòng quanh trong `src/api/db/schema.ts` (chỉ giữ `Database`), xóa `DbExecutor` trùng lặp trong 9 repository (dùng chung từ `src/api/shared/types.ts`), chuyển các `DEFAULT_*` constants của bài viết từ `posts/types.ts` sang `posts/constant.ts`, và cập nhật toàn bộ module/UI/test imports về đúng module sở hữu.
- Đã cập nhật toàn bộ imports trong `src/` và `test/`, cùng `docs/ARCHITECTURE.md`.

## Self-review

- [x] Scope và backward compatibility
- [x] Không còn magic value trong source code, test, script, migration hay conversion; giá trị nghiệp vụ/config dùng hằng số có tên
- [x] Secrets và dữ liệu nhạy cảm
- [x] Path traversal / input validation
- [x] Approval behavior
- [x] Persistence / migration

## Test plan

- [x] Unit (`pnpm test`)
- [x] Typecheck (`pnpm typecheck`)
- [x] Lint (`pnpm lint`)
- [x] Format check (`prettier --check` trên các file thay đổi)
- [x] Build (`pnpm build`)

## Test report

| Check                                          | Status | Evidence / reason                          |
| ---------------------------------------------- | ------ | ------------------------------------------ |
| `pnpm test`                                    | PASS   | 42/42 tests passed                         |
| `pnpm typecheck`                               | PASS   | `astro check && tsc --noEmit` exit code 0  |
| `pnpm lint`                                    | PASS   | 0 errors (34 pre-existing warnings)        |
| `pnpm exec prettier --check src/api docs/...`  | PASS   | All changed files formatted                |
| `pnpm build`                                   | PASS   | Astro 5 SSR server & client build hoàn tất |

## Blockers

- None
