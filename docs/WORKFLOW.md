# Workflow phát triển

## Trước khi bắt đầu

1. Đọc tài liệu liên quan trong `docs/`.
2. Kiểm tra file liên quan bằng `rg`.
3. Xác định phạm vi: public UI, admin UI, dữ liệu/API hoặc phối hợp.

## Quy trình

1. Thiết kế luồng: happy path, validation, loading, empty, error và responsive.
2. Nếu có lưu dữ liệu, thay schema/data layer trước.
3. Thêm endpoint có xác thực và validation server-side.
4. Triển khai UI theo design system.
5. Cập nhật sitemap/SEO/menu nếu nội dung public.
6. Viết hoặc mở rộng test logic, API hoặc dữ liệu.

## Biểu mẫu

- Trường bắt buộc: `required`, `aria-required="true"` và dấu `*` tại nhãn.
- Hiển thị phản hồi inline; không chỉ dùng `alert()`.
- Submit có trạng thái đang lưu và bật lại khi lỗi.
- Server là nguồn xác thực cuối cùng.

## Bàn giao

```bash
pnpm build
pnpm test
```

Báo kết quả cùng mọi giới hạn môi trường. Build không thay thế việc kiểm tra flow tương tác khi tính năng có UI/API.

## Task Execution Workflow

Trước khi chỉnh sửa, đọc DESIGN.md, AGENTS.md, tài liệu kiến trúc/bảo mật liên quan và code hiện có. Tạo hoặc cập nhật đúng một task file được đánh số trong tasks/ theo tasks/TEMPLATE.md, ghi scope, acceptance criteria, dependencies, security impact, test plan và assumptions.

Tuân thủ trạng thái analyzing → planning → in_progress → ready_for_test → ready_for_review → done, không bỏ qua trạng thái. Ở in_progress, triển khai vertical slice nhỏ nhất chạy thật; không dùng fake timer, dữ liệu success hard-code, guessed Codex method hoặc mock trong production path.

Trước khi chuyển trạng thái, tự review scope, secrets, path traversal, approval behavior, persistence và backward compatibility. Thêm/cập nhật unit/feature tests; chạy four quality gates và smoke test CLI/runtime phù hợp. Append test report PASS, FAIL, NOT RUN có lý do; cập nhật docs và tasks/INDEX.md nếu behavior/operations thay đổi.

Coder chỉ chuyển đến ready_for_review sau khi có test evidence và không được đặt done. done yêu cầu independent tester/reviewer approval, zero blockers. Khi blocked, ghi concrete error cùng alternatives đã thử; chỉ hỏi user cho product decision trọng yếu hoặc permission bắt buộc.
