# 008 — Refactor data access to Repository-Service pattern with Kysely

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Refactor toàn bộ tầng truy cập dữ liệu từ monolithic `dbService` (`src/lib/db.ts`) sang kiến trúc **Repository-Service Pattern** sử dụng **Kysely** với custom dialect cho `node:sqlite` (`DatabaseSync`):

- `src/db/`:
  - `dialect.ts`: Kysely `Dialect`, `Driver`, `DatabaseConnection` cho `node:sqlite` (`DatabaseSync`) kèm mutex cho transaction.
  - `schema.ts`: Kysely `Database` schema types và domain interfaces (`Post`, `Category`, `Page`, `MediaMetadata`, `MenuItem`, `User`, `Role`, `Session`, `Settings`).
  - `index.ts`: Khởi tạo singleton `DatabaseSync`, schema DDL, column migrations, và Kysely instance `db`.
  - `seed.ts`: Seed idempotent dữ liệu mẫu, RBAC (`super-admin`, permissions) và menu hệ thống qua Kysely.
- `src/repositories/`: Pure data-access repositories dùng Kysely query builder (`postRepository`, `categoryRepository`, `pageRepository`, `mediaRepository`, `menuRepository`, `userRepository`, `roleRepository`, `sessionRepository`, `settingRepository`).
- `src/services/`: Business logic & transaction orchestration (`postService`, `categoryService`, `pageService`, `mediaService`, `menuService`, `userService`, `roleService`, `sessionService`, `settingService`, `statsService`).
- `src/lib/auth.ts`, `src/middleware.ts`, API routes (`src/pages/api/**`), Astro pages/layouts/components: cập nhật sang async service calls.
- `src/lib/db.ts`: Giữ facade/re-export types tương thích hoặc trỏ sang `src/db/schema.ts` và `src/services/`.
- `docs/ARCHITECTURE.md`, `AGENTS.md`: Cập nhật kiến trúc mới.

## Acceptance criteria

- [x] Kysely dialect hoạt động trên `node:sqlite` (`DatabaseSync`) không cần native addon bên ngoài.
- [x] Mọi truy vấn SQL trong repositories sử dụng Kysely query builder (type-safe, parameterized).
- [x] Tách bạch rõ ràng: Repository chỉ thực hiện data access; Service xử lý nghiệp vụ (cycle detection, RBAC guard, category rename transaction, stats aggregation, v.v.).
- [x] Toàn bộ API routes, Astro pages, layouts, components, middleware và `auth.ts` hoạt động bình thường với async services.
- [x] Không có magic value trong code mới/chỉnh sửa.
- [x] `pnpm build` và `pnpm test` pass 100%, bổ sung test cho Kysely dialect / repository-service layer.

## Dependencies

- `kysely` (pure TypeScript SQL query builder).
- `node:sqlite` (`DatabaseSync` có sẵn trong Node 22).

## Security impact

- Mọi truy vấn qua Kysely đều parameterized, loại bỏ SQL injection (kể cả `sortBy` trong `getPosts` được whitelist qua map hằng số).
- Không thay đổi authentication/authorization boundary: `isAuthenticated`, `hasPermission`, `middleware.ts` giữ nguyên logic kiểm tra session và permission.

## Assumptions

- Mọi caller của `dbService` và `auth.ts` đều nằm trong ngữ cảnh hỗ trợ `async/await` (Astro component frontmatter, API routes, middleware, `node:test`).
- Dữ liệu hiện có trong `data/blog.db` được giữ nguyên vẹn.

## Plan

1. Tạo `src/db/dialect.ts`, `src/db/schema.ts`, `src/db/index.ts`, `src/db/seed.ts`.
2. Tạo 9 repositories trong `src/repositories/` + `index.ts`.
3. Tạo 10 services trong `src/services/` + `index.ts`.
4. Cập nhật `src/lib/auth.ts`, `src/lib/seo.ts`, `src/middleware.ts`, `src/lib/db.ts`.
5. Cập nhật toàn bộ `src/pages/api/**`, `src/pages/**`, `src/layouts/**`, `src/components/**`.
6. Cập nhật `test/*.test.js` và thêm test cho Kysely repository-service.
7. Cập nhật `docs/ARCHITECTURE.md` và chạy `pnpm test && pnpm build`.

## Implementation notes

- Hoàn tất tách tầng `src/db/` (Kysely `NodeSqliteDialect` trên `node:sqlite`), `src/repositories/` (9 repositories), và `src/services/` (10 services).
- Cập nhật toàn bộ `src/lib/auth.ts`, `src/middleware.ts`, API routes, layouts, components, Astro pages và test suite sang async services.

## Self-review

- [x] Scope và backward compatibility
- [x] Không còn magic value trong source code, test, script, migration hay conversion; giá trị nghiệp vụ/config dùng hằng số có tên
- [x] Secrets và dữ liệu nhạy cảm
- [x] Path traversal / input validation
- [x] Approval behavior
- [x] Persistence / migration

## Test plan

- [x] Unit (Kysely dialect + repositories + services)
- [x] Feature (Auth, RBAC, Hierarchy, Media folders, CRUD)
- [x] Build (`pnpm build`)
- [x] Existing test suite (`pnpm test`)
- [ ] CLI/runtime smoke test

## Test report

| Check                    | Status  | Evidence / reason                                                                                                                                                                       |
| ------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`              | PASS    | 38/38 tests passed (`test/repository-service.test.js`, `test/db.test.js`, `test/access-control.test.js`, `test/menu-manager.test.js`, v.v.)                                             |
| `pnpm build`             | PASS    | Astro 5 SSR server & client build completed cleanly                                                                                                                                     |
| `pnpm exec tsc --noEmit` | PARTIAL | 0 lỗi ở toàn bộ `src/db/`, `src/repositories/`, `src/services/`, `src/lib/` và API routes; chỉ còn 3 lỗi pre-existing ở `src/pages/sitemap.xml.ts` và `src/pages/uploads/[filename].ts` |
| CLI/runtime smoke test   | NOT RUN | Dev server không khởi chạy trong bước này; đã kiểm chứng bằng build SSR và Node test runner                                                                                             |

## Blockers

- None
