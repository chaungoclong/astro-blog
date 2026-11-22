# Hướng dẫn làm việc — Astro TechLog

Đọc tài liệu trong `docs/` trước khi thay đổi theo phạm vi:

- `PROJECT_OVERVIEW.md`: mục tiêu sản phẩm, người dùng và tính năng.
- `WORKFLOW.md`: quy trình phát triển, kiểm thử và bàn giao.
- `ARCHITECTURE.md`: routing, SQLite, API và bảo mật.
- `DESIGN_SYSTEM.md`: ngôn ngữ thiết kế và yêu cầu UI/UX.

## Quy tắc nền tảng

- Dùng Astro 5 SSR, Tailwind CSS v4 và `node:sqlite`. Giữ UI tĩnh trong `.astro`; không thêm framework client nếu HTML/CSS/vanilla script đủ dùng.
- Nội dung public phải content-first. Không đưa liên kết, nhãn hay lời mời vào `/admin` lên blog public.
- Mọi endpoint thay đổi dữ liệu phải kiểm tra `isAuthenticated(cookies)`.
- Chỉ dùng prepared statement khi truy cập SQLite. Không xóa/sửa dữ liệu mẫu khi kiểm thử; dọn mọi dữ liệu test do agent tạo.
- Không hard-code màu thương hiệu public khi có thể dùng `--brand`, `--brand-deep`, `--page-surface`.

### Không dùng magic value

- Không dùng magic value trong bất kỳ source code nào, gồm production code, test, script, migration, conversion và tooling. Đặt route string, giới hạn số lượng/kích thước, HTTP/cache policy, timeout, role/status và giá trị nghiệp vụ lặp lại vào hằng số có tên, đặt gần module sở hữu chúng.
- Chỉ dùng literal khi nó là cú pháp không thể tách rời và không mang ý nghĩa nghiệp vụ/configuration; nếu có thể đặt tên để làm rõ ý nghĩa thì phải dùng hằng số.

## Khi phát triển

1. Rà soát các file liên quan bằng `rg`; giữ thay đổi trong đúng phạm vi.
2. Với route/API/middleware, đọc `docs/ARCHITECTURE.md` và Astro Routing Guide khi cần.
3. Với UI, đọc `docs/DESIGN_SYSTEM.md`; mọi form mới cần required, loading, empty và error state rõ ràng.
4. Với schema SQLite, cập nhật type, `dbService`, endpoint, sitemap/SEO nếu public, và test phù hợp.
5. Chạy `pnpm build` và `pnpm test` trước bàn giao.

## Dev server

```bash
ASTRO_TELEMETRY_DISABLED=1 pnpm exec astro dev --background
```

Nếu sandbox không cho bind cổng, ghi rõ điều đó; không giả định server đã chạy.

## Astro docs

- Routing: https://docs.astro.build/en/guides/routing/
- Components: https://docs.astro.build/en/basics/astro-components/
- Styling: https://docs.astro.build/en/guides/styling/

## Task Execution Workflow

Before editing, read DESIGN.md, this file, relevant architecture/security docs, and existing code. Create or update exactly one numbered task file in tasks/ with scope, acceptance criteria, dependencies, security impact, test plan, and important assumptions.

Task states are mandatory and sequential: analyzing → planning → in_progress → ready_for_test → ready_for_review → done. Do not skip states. Implement the smallest real vertical slice; no fake timers, hardcoded success data, guessed Codex methods, or production mocks.

Self-review scope, secrets, path traversal, approval behavior, persistence, and backward compatibility. Add/update unit and feature tests; run four quality gates and relevant real CLI/runtime smoke test. Append PASS, FAIL, and NOT RUN results with reasons to the task file, and update docs plus tasks/INDEX.md when behavior or operations change.

Coder work may advance only through ready_for_review. done requires independent tester and reviewer approval with zero blockers. When blocked, record the concrete error and attempted alternatives. Ask the user only for a material product decision or required permission.
