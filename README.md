# 🚀 Astro TechLog & Admin CMS

Hệ thống **Blog công nghệ hiện đại tích hợp Trang quản trị nội dung (Admin CMS)** được xây dựng bằng **Astro 5 (SSR)**, cơ sở dữ liệu nhúng siêu tốc **Node.js 22 SQLite (`node:sqlite`)** và giao diện tùy biến chuẩn **Swiss Modernism 2.0** với **Tailwind CSS**.

---

## 🌟 Tính Năng Nổi Bật

### 🎨 1. Thiết Kế UI/UX Cao Cấp (Theo skill `ui-ux-pro-max`)
- **Phong cách Swiss Modernism 2.0:** Tỉ lệ tương phản chuẩn WCAG 2.1 AA (>= 4.5:1), hệ thống khoảng trắng toán học, phông chữ tối ưu khả năng đọc.
- **Thanh tiến độ đọc bài viết (Reading Progress Bar):** Động lực trực quan nằm ở đỉnh trang chi tiết bài viết, tự động tính toán tiến trình cuộn trang.
- **Mục lục bài viết tự động (Table of Contents - TOC):** Tự động trích xuất các tiêu đề `H2` & `H3` trong bài viết Markdown kèm liên kết neo (anchor links) cuộn mượt.
- **Nút sao chép mã (Code Block Copy Button):** Tự động gắn nút Copy kèm hiệu ứng đổi màu khi sao chép thành công trên mọi khối code Markdown.
- **Phím tắt hỗ trợ tiếp cận (Accessibility):** Tích hợp skip-link "Chuyển đến nội dung chính" và vòng viền `focus-visible` cho người dùng bàn phím.
- **Hỗ trợ `prefers-reduced-motion`:** Tự động vô hiệu hóa hoạt ảnh nặng khi người dùng bật chế độ giảm chuyển động trong hệ điều hành.

### 🔍 2. Tối Ưu Hóa SEO Toàn Diện
- **Schema.org JSON-LD có cấu trúc:**
  - `WebSite` Schema kèm `SearchAction` hỗ trợ hộp tìm kiếm trực tiếp trên Google.
  - `BlogPosting` Schema chi tiết trên từng bài viết (tiêu đề, ảnh, ngày tạo, ngày sửa, tác giả, chuyên mục, thẻ tags).
  - `BreadcrumbList` Schema cho thanh điều hướng breadcrumbs.
- **Canonical URLs & Open Graph:**
  - Thẻ chuẩn `<link rel="canonical">` tránh trùng lặp nội dung.
  - Bộ thẻ Facebook Open Graph (`og:type`, `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`).
  - Bộ thẻ Twitter Cards (`summary_large_image`).
- **Sitemap XML Động (`/sitemap.xml`):**
  - Tự động đồng bộ toàn bộ URL trang chủ, chuyên mục và bài viết đã xuất bản kèm `<lastmod>`, `<changefreq>`, `<priority>`.
- **Robots.txt Chuẩn SEO (`/robots.txt`):**
  - Cho phép lập chỉ mục các trang nội dung công khai.
  - Chặn bot thu thập thông tin trang nội bộ `/admin/` và `/api/`.
  - Khai báo chỉ thị liên kết tới `Sitemap`.

### 🧪 3. Bộ Kiểm Thử Tự Động (Automated Test Suite)
- Sử dụng trực tiếp **Node.js Test Runner** (`node:test` + `node:assert`): Không phụ thuộc thư viện bên ngoài, chạy tức thì dưới 300ms.
- **13 test cases bao phủ đầy đủ các thành phần cốt lõi:**
  - `test/utils.test.js`: Kiểm thử hàm slugify tiếng Việt, format ngày tháng, tính thời gian đọc, render Markdown.
  - `test/auth.test.js`: Kiểm thử mã hóa mật khẩu Scrypt, xác thực hash và chống bypass.
  - `test/db.test.js`: Vòng đời CRUD của bài viết, chuyên mục, cài đặt hệ thống và tăng lượt xem.
  - `test/seo-sitemap.test.js`: Kiểm thử dữ liệu cấu trúc Schema.org và sitemap XML.

---

## 🛠️ Trang Quản Trị Nội Dung (Admin CMS)

- **Đường dẫn quản trị:** `http://localhost:4321/admin`
- **Tài khoản mặc định:** `admin`
- **Mật khẩu mặc định:** `admin123`
- **Chức năng:**
  - Bảng điều khiển thống kê (Tổng bài, đã xuất bản, bản nháp, tổng lượt xem, chuyên mục).
  - Quản lý danh sách bài viết (Bộ lọc theo trạng thái, chuyên mục, tìm kiếm).
  - Soạn thảo Markdown với thanh công cụ nhanh và tab xem trước trực tiếp (Live Preview).
  - Quản lý chuyên mục bài viết.
  - Cài đặt thông tin thương hiệu, SEO và đổi mật khẩu quản trị.

---

## 💻 Hướng Dẫn Sử Dụng & Kiểm Thử

### 1. Chạy bài kiểm thử (Run Tests)
```bash
pnpm test
# hoặc: npm test
```

### 2. Chạy môi trường phát triển (Development)
```bash
pnpm dev
# hoặc: npm run dev
```
Mở trình duyệt truy cập: `http://localhost:4321`

### 3. Build & Chạy bản Production
```bash
pnpm build
pnpm preview
# hoặc chạy trực tiếp bằng Node:
node ./dist/server/entry.mjs
```
