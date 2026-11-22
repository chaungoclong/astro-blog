# 007 — Retro Editorial & Material Minimal Redesign

## Status: ready_for_review

## Scope

Thiết kế lại toàn bộ UI/UX cho cả Admin và Blog Public theo định hướng thiết kế tối ưu hóa trải nghiệm người dùng:
1. **Admin Console — Material Style + Minimal**: Giảm tương phản gắt, loại bỏ viền đen 2px thô cứng và đổ bóng vàng chói mắt; chuyển sang bảng màu Slate/Zinc dịu mắt, thẻ trắng viền mảnh 1px, bo góc mềm mại `rounded-lg/xl`, bóng đổ êm mắt, nút bấm Material filled/outlined, thanh điều hướng sidebar Dark Slate thanh lịch với active tab xanh dịu, trang soạn thảo bài viết (`new.astro`, `[id]/edit.astro`) và tạo menu trực quan, đồng bộ từng chi tiết.
2. **Public Blog — Retro Editorial**: Giữ nguyên phong cách retro editorial tối giản, tinh tế; typography Newsreader + Manrope + DM Mono; mục lục TOC sticky định vị nội dung; thẻ bài viết vuông vức; trang tác giả và tìm kiếm thu hút, dễ điều hướng.

### Phạm vi thay đổi chi tiết

- `src/styles/global.css`:
  - Dọn dẹp toàn bộ duplicate rules (giảm từ 3 lần lặp xuống 1 lần duy nhất).
  - Tách biệt kiểu bo góc bằng selector: `:where(body [class*="rounded"]):not(.admin-theme, .admin-theme *) { border-radius: var(--retro-radius) !important; }`. Nhờ đó, Admin có thể tự do dùng các góc bo mềm mại chuẩn Material (`rounded-lg`, `rounded-xl`, `rounded-full`) mà không làm ảnh hưởng đến hình học góc vuông retro của Public Blog.
  - Section 3 (Admin System): Nâng cấp `.admin-panel`, `.admin-primary-btn`, `.admin-secondary-btn`, `.admin-icon-btn`, `.admin-field`, `.admin-table`, `.admin-sticky-actions`, `.admin-status` sang chuẩn Material Minimal (viền 1px `#e2e8f0`, shadow mềm mại `0 1px 3px rgba(0,0,0,0.05)`, focus ring xanh `rgb(59 130 246 / 0.15)`).
- `src/layouts/AdminLayout.astro`:
  - Thêm class `admin-theme` vào thẻ `body`.
  - Sidebar: Nền Dark Slate (`bg-slate-900 text-slate-300 border-r border-slate-800`), logo TC xanh bo góc nhẹ, tab điều hướng active dạng pill mềm mại (`bg-blue-600 text-white shadow-xs`), badge đếm số thanh thoát, footer thông tin admin gọn gàng.
  - Header: Viền dưới 1px `border-slate-200/80`, breadcrumb trực quan rõ ràng, nút "+ Viết bài mới" Material filled (`bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs`).
  - Toast system: Thay đổi từ khối retro cứng sang Material toast nổi bật, dịu mắt với viền 1px, bo góc `rounded-xl`, bóng đổ mờ êm.
- `src/pages/admin/posts/new.astro` & `src/pages/admin/posts/[id]/edit.astro`:
  - Đồng bộ giao diện soạn thảo theo chuẩn Material Minimal.
  - Thẻ bao quanh: Nền trắng, viền mảnh 1px `border-slate-200/80`, bo góc `rounded-xl`, shadow nhẹ.
  - Inputs (Tiêu đề, slug, tóm tắt, tác giả, tags): viền 1px `border-slate-200`, focus ring mượt mà.
  - Markdown editor: Tabs "Soạn thảo" / "Xem trước" mềm mại, toolbar icon xám dịu `hover:bg-slate-100 rounded-md`.
  - Cụm nút hành động ghim `admin-sticky-actions`: bo góc `rounded-xl`, nền trắng mờ `bg-white/95 backdrop-blur-xs`, nút Lưu `bg-blue-600`.
- `src/pages/admin/index.astro`:
  - Metric cards: Nền trắng, viền mảnh, bo góc `rounded-xl`, icon trong hộp pastel (`bg-blue-50 text-blue-600`, `bg-emerald-50 text-emerald-600`, `bg-amber-50 text-amber-600`, `bg-purple-50 text-purple-600`).
  - Bảng quản lý bài viết gần đây: Header xám dịu, row hover mềm mại, status badge pill thanh lịch.
- `src/pages/admin/posts/index.astro`:
  - Toolbar bộ lọc (tìm kiếm, chọn chuyên mục, trạng thái) với input và select viền 1px mềm mại, nút "Lọc" gọn gàng.
  - Phân trang dạng nút bấm Material nhẹ nhàng.
- `src/pages/admin/menus/index.astro`:
  - Thư viện nguồn (Source library) và form thêm liên kết tùy chỉnh chuyển sang viền 1px mảnh `rounded-lg/xl`.
  - Cây menu trực quan với drag handle và các nút Lên/Xuống/Xóa êm mắt.
  - Dialog xóa nhánh menu dạng Material modal viền mảnh với backdrop mờ.
- `src/pages/admin/settings/index.astro`:
  - Form cấu hình chung và bảo mật đổi mật khẩu sang Material Minimal, color picker gọn gàng.
- `src/pages/admin/users/index.astro`, `roles/index.astro`, `permissions/index.astro`, `categories/index.astro`:
  - Đồng bộ viền 1px, bo góc nhẹ, nút bấm và dialog Material.
- Public Blog (đã nghiệm thu):
  - `BaseLayout.astro`, `PostCard.astro`, `blog/[slug].astro`, `search.astro`, `about.astro`, `category/[slug].astro` hoàn thiện theo Retro Editorial.

## Acceptance Criteria

1. [PASS] Admin chuyển sang phong cách Material Style + Minimal: độ tương phản dịu mắt, viền mảnh 1px, shadow mờ mềm mại, bo góc `rounded-lg/xl` tự nhiên.
2. [PASS] Thống nhất giao diện trang soạn thảo bài viết mới và chỉnh sửa bài viết (`new.astro`, `[id]/edit.astro`).
3. [PASS] Public blog giữ phong cách Retro Editorial tối giản, có TOC sticky, breadcrumbs đầy đủ, layout content-first.
4. [PASS] Đáp ứng tất cả ràng buộc kỹ thuật trong `test/retro-ui.test.js`:
   - Admin Layout có đủ link `/admin/users`, `/admin/roles`, `/admin/permissions`, `aria-label="Breadcrumb"`, `max-w-[100rem]`.
   - Post editor giữ `admin-sticky-actions`.
   - Page editor giữ `admin-save-panel`.
   - Category editor giữ `edit-cat-btn`, `delete-category-dialog`, `total_post_count`.
   - Media explorer & picker giữ `border-radius:var(--retro-radius)`.
5. [PASS] Toàn bộ test suite pass (`pnpm test`: 35/35 tests pass).
6. [PASS] Build thành công không có lỗi cú pháp (`ASTRO_TELEMETRY_DISABLED=1 pnpm build` exit code 0).

## Test Results

```
✔ 35/35 tests pass
✔ ASTRO_TELEMETRY_DISABLED=1 pnpm build: Success (built in 2.85s)
```
