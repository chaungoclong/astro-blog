# 015 — Add TypeScript typecheck, ESLint, and Prettier

- **Status:** ready_for_review
- **Owner:** Antigravity
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Thêm bộ công cụ kiểm tra chất lượng mã nguồn:

- **Typecheck**: `typecheck` script (`astro check && tsc --noEmit`) và sửa mọi lỗi type hiện có (nếu có).
- **ESLint**: `eslint.config.mjs` (flat config cho TypeScript, Astro, Node ESM) + scripts `lint` và `lint:fix`.
- **Prettier**: `.prettierrc` + `.prettierignore` (hỗ trợ `.ts`, `.js`, `.astro`, `.css`, `.md`) + scripts `format` và `format:check`.

## Acceptance criteria

- [x] `pnpm typecheck` pass 0 errors.
- [x] `pnpm lint` pass 0 errors.
- [x] `pnpm format:check` pass (hoặc format toàn bộ source theo config).
- [x] `pnpm test` và `pnpm build` pass 100%.

## Dependencies

- `typescript`, `@astrojs/check`
- `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`
- `prettier`, `prettier-plugin-astro`

## Security impact

- Không ảnh hưởng runtime; chỉ bổ sung devDependencies và static checks.

## Assumptions

- Dùng ESLint v9+ flat config (`eslint.config.mjs`).

## Plan

1. Cài đặt devDependencies (`typescript`, `@astrojs/check`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, `prettier`, `prettier-plugin-astro`).
2. Tạo `eslint.config.mjs`, `.prettierrc`, `.prettierignore` và thêm scripts vào `package.json`.
3. Chạy `pnpm typecheck`, `pnpm lint`, `pnpm format:check` và sửa các lỗi phát sinh.
4. Chạy `pnpm test && pnpm build`.

## Implementation notes

- Đã cài đặt `typescript@^5.9.3`, `@astrojs/check`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, `prettier`, `prettier-plugin-astro`.
- Đã cấu hình [eslint.config.mjs](file:///home/long/Dev/astro-cms-test/eslint.config.mjs), [.prettierrc](file:///home/long/Dev/astro-cms-test/.prettierrc), [.prettierignore](file:///home/long/Dev/astro-cms-test/.prettierignore) và scripts `typecheck`, `lint`, `lint:fix`, `format`, `format:check` trong [package.json](file:///home/long/Dev/astro-cms-test/package.json).
- Đã sửa toàn bộ lỗi type & lint phát hiện bởi `astro check` và `eslint` (0 errors, 0 warnings, 0 hints).

## Self-review

- [x] Scope và backward compatibility
- [x] Không còn magic value trong source code, test, script, migration hay conversion; giá trị nghiệp vụ/config dùng hằng số có tên
- [x] Secrets và dữ liệu nhạy cảm
- [x] Path traversal / input validation
- [x] Approval behavior
- [x] Persistence / migration

## Test plan

- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm format:check`
- [x] `pnpm test`
- [x] `pnpm build`

## Test report

| Check               | Status | Evidence / reason                                                              |
| ------------------- | ------ | ------------------------------------------------------------------------------ |
| `pnpm format:check` | PASS   | All matched files use Prettier code style                                      |
| `pnpm typecheck`    | PASS   | `astro check` (0 errors, 0 warnings, 0 hints across 136 files) + `tsc --noEmit` |
| `pnpm lint`         | PASS   | `eslint .` exited 0 (0 errors)                                                 |
| `pnpm test`         | PASS   | 42/42 tests passed                                                             |
| `pnpm build`        | PASS   | Astro 5 SSR server & client build hoàn tất                                     |

## Blockers

- None
