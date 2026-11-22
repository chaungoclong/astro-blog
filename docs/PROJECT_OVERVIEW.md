# Tổng quan dự án

## Astro TechLog

Astro TechLog là blog công nghệ SSR, cho phép biên tập viên quản lý bài viết, chuyên mục, trang tĩnh và cấu hình thương hiệu qua khu vực admin riêng tư.

| Nhóm          | Nhu cầu chính                                                           |
| ------------- | ----------------------------------------------------------------------- |
| Độc giả       | Đọc nhanh nội dung công nghệ, tìm kiếm và duyệt theo chuyên mục.        |
| Biên tập viên | Viết Markdown, lưu bản nháp, xuất bản và quản lý cấu trúc nội dung.     |
| Quản trị viên | Cấu hình website, màu thương hiệu, phiên đăng nhập và dữ liệu nội dung. |

## Phạm vi

- Public: trang chủ, chuyên mục, tìm kiếm, bài viết và Pages đã xuất bản; SEO gồm canonical, Open Graph, JSON-LD, sitemap, robots.
- Admin: dashboard; CRUD bài viết, chuyên mục, Pages; cài đặt thương hiệu; đăng nhập session cookie.
- File Manager: upload, duyệt theo root/folder con, copy URL và xóa ảnh, PDF, ZIP hoặc tài liệu Office qua storage abstraction. Local filesystem là provider mặc định; deployment có thể thêm provider tương thích S3/R2.
- Blog public không hiển thị đường dẫn hoặc lời mời vào admin.

## Trạng thái nội dung

`draft` chỉ hiển thị cho admin. `published` hiển thị công khai và có trong sitemap. Page có `show_in_nav` để kiểm soát header/footer.

# Quản trị nội dung mở rộng

CMS hỗ trợ taxonomy nhiều cấp, menu public cấu hình và sắp xếp trong admin, nhiều người dùng và phân quyền chi tiết theo role/permission. Permission được kiểm tra ở server cho từng khu vực quản trị và API thay đổi dữ liệu.
